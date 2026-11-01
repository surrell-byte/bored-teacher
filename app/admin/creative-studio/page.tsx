'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { GAME_CATALOG } from '@/games/catalog.data';
import { isCreatorUser, onAuthStateChanged } from '@/lib/firebase';

type Format = 'square' | 'portrait' | 'story' | 'landscape';
type Idea = 'game-spotlight' | 'classroom-tip' | 'challenge' | 'new-game';
const FORMATS: Record<Format, { label: string; width: number; height: number }> = {
  square: { label: 'Square · Instagram / Facebook', width: 1080, height: 1080 },
  portrait: { label: 'Portrait · Instagram feed', width: 1080, height: 1350 },
  story: { label: 'Vertical · Reels / TikTok / Stories', width: 1080, height: 1920 },
  landscape: { label: 'Landscape · Facebook', width: 1200, height: 630 },
};
const IDEAS: Record<Idea, string> = {
  'game-spotlight': 'Game spotlight',
  'classroom-tip': 'Teacher tip',
  challenge: 'Try this challenge',
  'new-game': 'New game announcement',
};
const games = Object.entries(GAME_CATALOG).map(([id, game]) => ({ id, ...game })).sort((a, b) => a.name.localeCompare(b.name));

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number) {
  const lines: string[] = [];
  let line = '';
  for (const word of text.split(/\s+/)) {
    const candidate = line ? `${line} ${word}` : word;
    if (line && ctx.measureText(candidate).width > maxWidth) { lines.push(line); line = word; }
    else line = candidate;
  }
  if (line) lines.push(line);
  return lines;
}

export default function CreativeStudioPage() {
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [access, setAccess] = useState<'loading' | 'allowed'>('loading');
  const [gameId, setGameId] = useState(games[0]?.id ?? '');
  const [format, setFormat] = useState<Format>('story');
  const [idea, setIdea] = useState<Idea>('game-spotlight');
  const [headline, setHeadline] = useState('Learning can feel like play.');
  const [subtitle, setSubtitle] = useState('Quick, joyful games for curious minds.');
  const [cta, setCta] = useState('Play free at boredteacher.com');
  const [caption, setCaption] = useState('A little learning, a lot of fun 🎮');
  const [status, setStatus] = useState('');
  const [busy, setBusy] = useState(false);
  const game = games.find(item => item.id === gameId) ?? games[0];
  const specs = FORMATS[format];
  const hashtags = useMemo(() => ['#BoredTeacher', '#LearningThroughPlay', '#TeachersOfInstagram', `#${game?.name.replace(/[^a-z0-9]/gi, '') || 'LearningGames'}`].join(' '), [game?.name]);

  useEffect(() => onAuthStateChanged(user => {
    if (!user) router.replace('/auth');
    else if (isCreatorUser(user)) setAccess('allowed');
    else router.replace('/hub');
  }), [router]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('creator-creative-studio-draft');
      if (saved) {
        const draft = JSON.parse(saved);
        if (draft.gameId && games.some(item => item.id === draft.gameId)) setGameId(draft.gameId);
        if (draft.format in FORMATS) setFormat(draft.format);
        if (draft.idea in IDEAS) setIdea(draft.idea);
        if (typeof draft.headline === 'string') setHeadline(draft.headline);
        if (typeof draft.subtitle === 'string') setSubtitle(draft.subtitle);
        if (typeof draft.cta === 'string') setCta(draft.cta);
        if (typeof draft.caption === 'string') setCaption(draft.caption);
      }
    } catch { /* Start with a fresh draft if local storage is invalid. */ }
  }, []);

  useEffect(() => {
    localStorage.setItem('creator-creative-studio-draft', JSON.stringify({ gameId, format, idea, headline, subtitle, cta, caption }));
    const canvas = canvasRef.current;
    if (!canvas || !game) return;
    const { width, height } = FORMATS[format];
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const drawingContext: CanvasRenderingContext2D = ctx;
    let cancelled = false;
    let image: HTMLImageElement | undefined;
    const draw = (progress = 1) => {
      const scale = width / 1080;
      const accent = game.barColor?.startsWith('#') ? game.barColor : '#55e3b1';
      function paintPreview(cover?: HTMLImageElement) {
        drawingContext.clearRect(0, 0, width, height);
        const bg = drawingContext.createLinearGradient(0, 0, width, height);
        bg.addColorStop(0, '#101723'); bg.addColorStop(0.56, '#122a35'); bg.addColorStop(1, '#101522');
        drawingContext.fillStyle = bg; drawingContext.fillRect(0, 0, width, height);
        const imageH = height * (format === 'landscape' ? 0.82 : 0.58);
        const imageW = width * (format === 'landscape' ? 0.6 : 0.88);
        const imageX = format === 'landscape' ? width - imageW : (width - imageW) / 2;
        const imageY = format === 'landscape' ? (height - imageH) / 2 : height * 0.24;
        const radius = 34 * scale;
        drawingContext.save();
        drawingContext.beginPath(); drawingContext.roundRect(imageX, imageY, imageW, imageH, radius); drawingContext.clip();
        if (cover?.naturalWidth) {
          const ratio = Math.max(imageW / cover.width, imageH / cover.height);
          const dw = cover.width * ratio; const dh = cover.height * ratio;
          drawingContext.drawImage(cover, imageX + (imageW - dw) / 2, imageY + (imageH - dh) / 2, dw, dh);
        } else {
          const artwork = drawingContext.createLinearGradient(imageX, imageY, imageX + imageW, imageY + imageH);
          artwork.addColorStop(0, accent);
          artwork.addColorStop(1, '#122a35');
          drawingContext.fillStyle = artwork;
          drawingContext.fillRect(imageX, imageY, imageW, imageH);
          drawingContext.textAlign = 'center';
          drawingContext.textBaseline = 'middle';
          drawingContext.font = `900 ${Math.min(imageW * 0.28, imageH * 0.28)}px Arial`;
          drawingContext.fillStyle = 'rgba(255,255,255,.92)';
          drawingContext.fillText(game.icon, imageX + imageW / 2, imageY + imageH / 2);
          drawingContext.font = `800 ${28 * scale}px Arial`;
          drawingContext.fillText(game.name, imageX + imageW / 2, imageY + imageH * 0.76, imageW * 0.84);
        }
        drawingContext.restore();
        paintText(drawingContext, progress);
      }

      function paintText(context: CanvasRenderingContext2D, animationProgress: number) {
        const top = format === 'landscape' ? 82 : height * 0.065;
        const left = format === 'landscape' ? 72 : 78;
        const contentW = format === 'landscape' ? width * 0.5 : width - 156;
        context.fillStyle = 'rgba(8, 16, 24, .76)';
        context.beginPath(); context.roundRect(left, top, 240 * scale, 54 * scale, 27 * scale); context.fill();
        context.fillStyle = '#aaf5d9'; context.font = `800 ${22 * scale}px Arial`; context.textBaseline = 'middle';
        context.fillText(`BORED TEACHER  •  ${IDEAS[idea].toUpperCase()}`, left + 22 * scale, top + 27 * scale);
        const titleY = (format === 'landscape' ? height * 0.35 : height * 0.14) + (1 - animationProgress) * 35 * scale;
        context.globalAlpha = animationProgress;
        context.fillStyle = '#ffffff'; context.font = `800 ${format === 'story' ? 78 : 72 * scale}px Arial`; context.textBaseline = 'top';
        let y = titleY;
        for (const line of wrapText(context, headline || game.name, contentW).slice(0, 3)) { context.fillText(line, left, y); y += 1.08 * (format === 'story' ? 78 : 72 * scale); }
        context.fillStyle = accent; context.font = `700 ${34 * scale}px Arial`;
        y += 18 * scale;
        for (const line of wrapText(context, subtitle, contentW).slice(0, 3)) { context.fillText(line, left, y); y += 1.35 * 34 * scale; }
        const footerY = height - (format === 'story' ? 165 : 74) * scale;
        context.globalAlpha = 1;
        context.fillStyle = '#ffffff'; context.font = `700 ${26 * scale}px Arial`; context.fillText(cta, left, footerY);
        context.fillStyle = 'rgba(255,255,255,.65)'; context.font = `600 ${20 * scale}px Arial`; context.fillText('Bored Teacher · Games that make learning fun', left, footerY + 42 * scale);
      }

      paintPreview();
      image = new Image();
      image.onload = () => { if (!cancelled) paintPreview(image); };
      image.onerror = () => { if (!cancelled) paintPreview(); };
      image.src = game.cover;
    };
    draw();
    return () => {
      cancelled = true;
      if (image) {
        image.onload = null;
        image.onerror = null;
      }
    };
  }, [access, gameId, format, idea, headline, subtitle, cta, caption, game]);

  function downloadImage() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `bored-teacher-${game?.id}-${format}.png`;
    link.href = canvas.toDataURL('image/png'); link.click();
    setStatus('High-resolution PNG downloaded.');
  }

  async function downloadVideo() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (!('MediaRecorder' in window) || !canvas.captureStream) { setStatus('Video export is not supported in this browser. Download the PNG instead.'); return; }
    setBusy(true); setStatus('Rendering an 8-second vertical video…');
    try {
      const stream = canvas.captureStream(30);
      const mimeType = ['video/mp4;codecs=avc1.42E01E', 'video/mp4', 'video/webm;codecs=vp9', 'video/webm;codecs=vp8', 'video/webm'].find(type => MediaRecorder.isTypeSupported(type));
      if (!mimeType) throw new Error('This browser cannot encode a downloadable video.');
      const recorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: 8_000_000 });
      const chunks: BlobPart[] = [];
      const coverImage = new Image();
      coverImage.src = game!.cover;
      if (!coverImage.complete) await new Promise<void>((resolve, reject) => { coverImage.onload = () => resolve(); coverImage.onerror = () => reject(new Error('Game cover artwork could not be loaded.')); });
      const finished = new Promise<Blob>((resolve, reject) => {
        recorder.ondataavailable = event => { if (event.data.size) chunks.push(event.data); };
        recorder.onerror = () => reject(new Error('Video export failed.'));
        recorder.onstop = () => resolve(new Blob(chunks, { type: mimeType }));
      });
      recorder.start();
      const started = performance.now();
      await new Promise<void>(resolve => {
        const frame = (now: number) => {
          const progress = Math.min(1, (now - started) / 1300);
          const canvas = canvasRef.current!; const ctx = canvas.getContext('2d')!;
          // Repaint the designed artwork into its native resolution, easing the title into place.
          drawVideoFrame(ctx, canvas.width, canvas.height, coverImage, game!, format, idea, headline, subtitle, cta, progress);
          if (now - started < 8000) requestAnimationFrame(frame); else resolve();
        };
        requestAnimationFrame(frame);
      });
      recorder.stop();
      const blob = await finished;
      const url = URL.createObjectURL(blob); const link = document.createElement('a');
      const extension = mimeType.startsWith('video/mp4') ? 'mp4' : 'webm';
      link.href = url; link.download = `bored-teacher-${game?.id}-${format}.${extension}`; link.click();
      window.setTimeout(() => URL.revokeObjectURL(url), 5000);
      setStatus('8-second WebM video downloaded.');
    } catch (error) { setStatus(error instanceof Error ? error.message : 'Video export failed.'); }
    finally { setBusy(false); }
  }

  if (access === 'loading') return null;
  return <div className="admin-feedback-page creative-studio-page">
    <header className="admin-feedback-header"><div><p className="suggestions-kicker">Creator workspace</p><h1 className="hub-welcome-title">Creative studio</h1><p className="hub-welcome-sub">Turn a game into ready-to-post social content. Drafts save on this device.</p></div><Link href="/admin" className="pill-btn" style={{ textDecoration: 'none' }}>Creator view</Link></header>
    <div className="creative-studio-layout">
      <section className="shell-card creative-studio-controls" aria-label="Content settings">
        <label>Game<select value={gameId} onChange={e => setGameId(e.target.value)}>{games.map(item => <option key={item.id} value={item.id}>{item.icon} {item.name}</option>)}</select></label>
        <label>Post idea<select value={idea} onChange={e => { const next = e.target.value as Idea; setIdea(next); if (next === 'classroom-tip') { setHeadline('A quick classroom reset'); setSubtitle('Give learners a fun way to practise together.'); setCaption('Need a quick classroom reset? Try a playful learning break.'); } else if (next === 'challenge') { setHeadline(`Can you beat ${game?.name}?`); setSubtitle('Take the challenge and show us your score.'); setCaption(`Your challenge is on! Can you beat ${game?.name}?`); } else if (next === 'new-game') { setHeadline(`${game?.name} is ready to play!`); setSubtitle(game?.desc ?? 'A new game for curious minds.'); setCaption(`Meet ${game?.name} — now ready to play!`); } else { setHeadline('Learning can feel like play.'); setSubtitle(game?.desc ?? 'Quick, joyful games for curious minds.'); setCaption(`Try ${game?.name} and make learning feel like play!`); } }}>{Object.entries(IDEAS).map(([id, label]) => <option key={id} value={id}>{label}</option>)}</select></label>
        <label>Social format<select value={format} onChange={e => setFormat(e.target.value as Format)}>{Object.entries(FORMATS).map(([id, item]) => <option key={id} value={id}>{item.label} · {item.width}×{item.height}</option>)}</select></label>
        <label>Headline<input value={headline} maxLength={100} onChange={e => setHeadline(e.target.value)} /></label>
        <label>Supporting text<textarea rows={3} value={subtitle} maxLength={180} onChange={e => setSubtitle(e.target.value)} /></label>
        <label>Call to action<input value={cta} maxLength={80} onChange={e => setCta(e.target.value)} /></label>
        <label>Post caption<textarea rows={3} value={caption} maxLength={500} onChange={e => setCaption(e.target.value)} /></label>
        <div className="creative-studio-hashtags"><strong>Suggested hashtags</strong><p>{hashtags}</p><button type="button" className="pill-btn" onClick={() => { void navigator.clipboard.writeText(`${caption}\n\n${hashtags}`); setStatus('Caption and hashtags copied.'); }}>Copy caption + hashtags</button></div>
        <div className="creative-studio-downloads"><button type="button" className="btn-primary" onClick={downloadImage}>Download PNG · {specs.width}×{specs.height}</button><button type="button" className="pill-btn" onClick={downloadVideo} disabled={busy}>{busy ? 'Rendering video…' : 'Download 8-sec video'}</button><small>Images export as PNG. Video exports as MP4 when your browser supports it, otherwise WebM, at 30 fps.</small>{status && <span role="status">{status}</span>}</div>
      </section>
      <section className="creative-studio-preview-column"><div className="creative-studio-preview-heading"><div><span className="suggestions-kicker">Live preview</span><h2>{game?.name}</h2></div><span>{specs.width} × {specs.height}</span></div><div className={`creative-studio-canvas-wrap format-${format}`}><canvas ref={canvasRef} aria-label="Preview of social artwork" /></div><p className="creative-studio-preview-note">The preview uses the game’s cover artwork. Export is rendered at full resolution for the selected format.</p></section>
    </div>
  </div>;
}

function drawVideoFrame(ctx: CanvasRenderingContext2D, width: number, height: number, img: HTMLImageElement, game: typeof games[number], format: Format, idea: Idea, headline: string, subtitle: string, cta: string, progress: number) {
  // The animation frame keeps artwork local and canvas-safe by repainting the same design elements.
  const accent = '#55e3b1';
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, '#101723'); gradient.addColorStop(1, '#122a35'); ctx.fillStyle = gradient; ctx.fillRect(0, 0, width, height);
  const paint = () => {
    const scale = width / 1080; const left = format === 'landscape' ? 72 : 78;
    const top = format === 'landscape' ? 82 : height * 0.1;
    const imageH = height * (format === 'landscape' ? 0.82 : 0.58); const imageW = width * (format === 'landscape' ? 0.6 : 0.88);
    const imageX = format === 'landscape' ? width - imageW : (width - imageW) / 2; const imageY = format === 'landscape' ? (height - imageH) / 2 : height * 0.24;
    if (img.complete && img.naturalWidth) { const ratio = Math.max(imageW / img.width, imageH / img.height); ctx.save(); ctx.beginPath(); ctx.roundRect(imageX, imageY, imageW, imageH, 34 * scale); ctx.clip(); ctx.drawImage(img, imageX + (imageW - img.width * ratio) / 2, imageY + (imageH - img.height * ratio) / 2, img.width * ratio, img.height * ratio); ctx.restore(); }
    ctx.fillStyle = 'rgba(8,16,24,.76)'; ctx.beginPath(); ctx.roundRect(left, top, 240 * scale, 54 * scale, 27 * scale); ctx.fill();
    ctx.fillStyle = '#aaf5d9'; ctx.font = `800 ${22 * scale}px Arial`; ctx.textBaseline = 'middle'; ctx.fillText(`BORED TEACHER  •  ${IDEAS[idea].toUpperCase()}`, left + 22 * scale, top + 27 * scale);
    ctx.globalAlpha = Math.min(1, progress * 1.4); ctx.fillStyle = '#fff'; ctx.font = `800 ${format === 'story' ? 78 : 72 * scale}px Arial`; ctx.textBaseline = 'top';
    let y = (format === 'landscape' ? height * 0.35 : height * 0.11) + (1 - Math.min(1, progress * 1.4)) * 35 * scale;
    for (const line of wrapText(ctx, headline || game.name, format === 'landscape' ? width * 0.5 : width - 156).slice(0, 3)) { ctx.fillText(line, left, y); y += 78 * scale; }
    ctx.fillStyle = accent; ctx.font = `700 ${34 * scale}px Arial`; y += 18 * scale;
    wrapText(ctx, subtitle, format === 'landscape' ? width * 0.5 : width - 156).slice(0, 3).forEach(line => { ctx.fillText(line, left, y); y += 46 * scale; });
    const footerY = height - (format === 'story' ? 165 : 74) * scale; ctx.globalAlpha = 1; ctx.fillStyle = '#fff'; ctx.font = `700 ${26 * scale}px Arial`; ctx.fillText(cta, left, footerY);
    ctx.fillStyle = 'rgba(255,255,255,.65)'; ctx.font = `600 ${20 * scale}px Arial`; ctx.fillText('Bored Teacher · Games that make learning fun', left, footerY + 42 * scale);
  };
  paint();
}
