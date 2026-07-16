import { useEffect, useRef, useState } from "react";
import { useStorage } from "@/hooks/useStorage";

const TILE = 30;
const RAW_MAZE = [
  "###############", "#.............#", "#.####.#.####.#", "#.#.........#.#",
  "#.#.#######.#.#", "#.#...#...#.#.#", "##....#.#....##", "###.#...#.#.###",
  "#.............#", "#.#.#######.#.#", "#.#.........#.#", "#.####.#.####.#",
  "#.............#", "###############",
];
const ROWS = RAW_MAZE.length;
const COLS = RAW_MAZE[0].length;
const W = COLS * TILE, H = ROWS * TILE;

function buildMaze() {
  const walls = [], pellets = [];
  let total = 0;
  for (let r = 0; r < ROWS; r++) {
    walls.push([]); pellets.push([]);
    for (let c = 0; c < COLS; c++) {
      walls[r][c] = RAW_MAZE[r][c] === "#";
      pellets[r][c] = RAW_MAZE[r][c] === ".";
      if (pellets[r][c]) total++;
    }
  }
  return { walls, pellets, total };
}

function bfs(walls, sx, sy, tx, ty) {
  if (sx === tx && sy === ty) return null;
  const q = [[sx, sy, null]];
  const visited = new Set([`${sx},${sy}`]);
  while (q.length) {
    const [x, y, first] = q.shift();
    for (const [dx, dy] of [[0,-1],[0,1],[-1,0],[1,0]]) {
      const nx = x+dx, ny = y+dy;
      if (nx<0||ny<0||nx>=COLS||ny>=ROWS||walls[ny][nx]||visited.has(`${nx},${ny}`)) continue;
      const step = first ?? [nx, ny];
      if (nx===tx && ny===ty) return step;
      visited.add(`${nx},${ny}`); q.push([nx, ny, step]);
    }
  }
  return null;
}

export default function PacMan({ onComplete }) {
  const canvasRef = useRef(null);
  const gameRef = useRef(null);
  const [ui, setUi] = useState({ score: 0, lives: 3, state: "playing" });
  const [best, setBest] = useStorage("pacman-high-score", 0);

  useEffect(() => {
    const canvas = canvasRef.current;
    canvas.width = W; canvas.height = H;
    const ctx = canvas.getContext("2d");
    let animId;

    function mkState() {
      const { walls, pellets, total } = buildMaze();
      return { walls, pellets, totalPellets: total, eaten: 0, score: 0, lives: 3, pac: { x:1, y:1, dx:0, dy:0, ndx:0, ndy:0, mouthAngle:0.2, mouthDir:1 }, ghost: { x:COLS-2, y:ROWS-2, color:"#f87171" }, state: "playing", moveTimer: 0, ghostTimer: 0 };
    }
    gameRef.current = mkState();

    function handleKey(e) {
      const s = gameRef.current;
      if (!s || s.state !== "playing") return;
      if (e.key==="ArrowLeft") { s.pac.ndx=-1; s.pac.ndy=0; }
      if (e.key==="ArrowRight") { s.pac.ndx=1;  s.pac.ndy=0; }
      if (e.key==="ArrowUp") { s.pac.ndx=0; s.pac.ndy=-1; }
      if (e.key==="ArrowDown") { s.pac.ndx=0;  s.pac.ndy=1; }
      e.preventDefault();
    }
    window.addEventListener("keydown", handleKey);

    function update() {
      const s = gameRef.current;
      if (!s || s.state !== "playing") return;
      s.pac.mouthAngle += 0.08 * s.pac.mouthDir;
      if (s.pac.mouthAngle > 0.35 || s.pac.mouthAngle < 0.02) s.pac.mouthDir *= -1;

      if (++s.moveTimer >= 5) {
        s.moveTimer = 0;
        for (const [ddx, ddy] of [[s.pac.ndx,s.pac.ndy],[s.pac.dx,s.pac.dy]]) {
          const nx=s.pac.x+ddx, ny=s.pac.y+ddy;
          if (nx>=0&&ny>=0&&nx<COLS&&ny<ROWS && !s.walls[ny][nx]) {
            s.pac.x=nx; s.pac.y=ny; s.pac.dx=ddx; s.pac.dy=ddy; break;
          }
        }
        if (s.pellets[s.pac.y][s.pac.x]) {
          s.pellets[s.pac.y][s.pac.x]=false; s.score+=10; s.eaten++;
          setUi(u=>({...u, score:s.score}));
          if (s.eaten === s.totalPellets) {
            s.state="win"; setUi(u=>({...u,state:"win"}));
            onComplete?.(s.score, 100);
          }
        }
      }

      if (++s.ghostTimer >= 15) {
        s.ghostTimer=0;
        const step = bfs(s.walls, s.ghost.x, s.ghost.y, s.pac.x, s.pac.y);
        if (step) { s.ghost.x=step[0]; s.ghost.y=step[1]; }
      }

      if (s.ghost.x===s.pac.x && s.ghost.y===s.pac.y) {
        s.lives--;
        setUi(u=>({...u, lives:s.lives}));
        if (s.lives<=0) {
          s.state="dead"; setUi(u=>({...u,state:"dead"}));
          const acc = Math.round((s.eaten / s.totalPellets) * 100);
          onComplete?.(s.score, acc);
          return;
        }
        s.pac={x:1,y:1,dx:0,dy:0,ndx:0,ndy:0,mouthAngle:0.2,mouthDir:1};
        s.ghost={x:COLS-2,y:ROWS-2,color:"#f87171"};
      }
    }

    function draw() {
      const s = gameRef.current; if (!s) return;
      ctx.fillStyle="#000"; ctx.fillRect(0,0,W,H);
      for (let r=0;r<ROWS;r++) for (let c=0;c<COLS;c++) {
        if (s.walls[r][c]) { ctx.fillStyle="#1d4ed8"; ctx.fillRect(c*TILE,r*TILE,TILE,TILE); ctx.strokeStyle="#3b82f6"; ctx.strokeRect(c*TILE+0.5,r*TILE+0.5,TILE-1,TILE-1); }
        if (s.pellets[r][c]) { ctx.fillStyle="#fbbf24"; ctx.beginPath(); ctx.arc(c*TILE+TILE/2,r*TILE+TILE/2,4,0,Math.PI*2); ctx.fill(); }
      }
      const gx=s.ghost.x*TILE, gy=s.ghost.y*TILE;
      ctx.fillStyle=s.ghost.color; ctx.beginPath(); ctx.arc(gx+TILE/2,gy+TILE/2-2,TILE/2-3,Math.PI,0); ctx.lineTo(gx+TILE-3,gy+TILE-3); ctx.closePath(); ctx.fill();
      const px=s.pac.x*TILE, py=s.pac.y*TILE, angle=s.pac.mouthAngle*Math.PI;
      let start=angle, end=Math.PI*2-angle;
      if (s.pac.dx===0&&s.pac.dy===-1) { start+=1.5*Math.PI; end+=1.5*Math.PI; }
      else if (s.pac.dx===0&&s.pac.dy===1) { start+=0.5*Math.PI; end+=0.5*Math.PI; }
      else if (s.pac.dx===-1) { start+=Math.PI; end+=Math.PI; }
      ctx.fillStyle="#fbbf24"; ctx.beginPath(); ctx.moveTo(px+TILE/2,py+TILE/2); ctx.arc(px+TILE/2,py+TILE/2,TILE/2-3,start,end); ctx.closePath(); ctx.fill();
    }

    function loop() { update(); draw(); animId=requestAnimationFrame(loop); }
    loop();
    return () => { cancelAnimationFrame(animId); window.removeEventListener("keydown",handleKey); };
  }, [onComplete]);

  useEffect(() => {
    if (ui.score > best) {
      setBest(ui.score);
    }
  }, [ui.score, best, setBest]);

  return (
    <div style={{ minHeight:"100vh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", background:"#000", fontFamily:"'Segoe UI', sans-serif", padding:16 }}>
      <div style={{ display:"flex", gap:28, marginBottom:10, alignItems:"center" }}>
        <span style={{ color:"#fbbf24", fontWeight:700 }}>⭐ {ui.score}</span>
        <span style={{ color:"#fbbf24", fontSize:"1.3rem", fontWeight:800 }}>PAC-MAN</span>
        <span style={{ color:"#f87171" }}>{Array.from({length:3},(_,i)=>i<ui.lives?"💛":"🖤").join("")}</span>
      </div>
      <div style={{ position:"relative" }}>
        <canvas ref={canvasRef} style={{ border:"2px solid #1d4ed8", borderRadius:4, display:"block" }} />
        {(ui.state!=="playing") && (
          <div style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", background:"rgba(0,0,0,0.85)" }}>
            <div style={{ fontSize:"3rem" }}>{ui.state==="win"?"🏆":"👻"}</div>
            <h2 style={{ color:"#fff" }}>{ui.state==="win"?"You Win!":"Game Over"}</h2>
            <button onClick={() => window.location.reload()} style={{ padding:"10px 24px", borderRadius:999, background:"#fbbf24", fontWeight:800, cursor:"pointer" }}>🔄 Retry</button>
          </div>
        )}
      </div>
      <p style={{ color:"#94a3b8", marginTop:10 }}>Best: {best}</p>
    </div>
  );
}