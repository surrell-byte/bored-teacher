import { useEffect, useRef, useState } from "react";

const TILE = 30;
const RAW_MAZE = [
  "###############",
  "#.............#",
  "#.####.#.####.#",
  "#.#.........#.#",
  "#.#.#######.#.#",
  "#.#...#...#.#.#",
  "##....#.#....##",
  "###.#...#.#.###",
  "#.............#",
  "#.#.#######.#.#",
  "#.#.........#.#",
  "#.####.#.####.#",
  "#.............#",
  "###############",
];
const ROWS = RAW_MAZE.length;
const COLS = RAW_MAZE[0].length;
const W = COLS * TILE, H = ROWS * TILE;

function buildMaze() {
  const walls = [], pellets = [];
  let total = 0;
  for (let r = 0; r < ROWS; r++) {
    walls.push([]);
    pellets.push([]);
    for (let c = 0; c < COLS; c++) {
      walls[r][c] = RAW_MAZE[r][c] === "#";
      pellets[r][c] = RAW_MAZE[r][c] === ".";
      if (pellets[r][c]) total++;
    }
  }
  return { walls, pellets, total };
}

// BFS for ghost
function bfs(walls, sx, sy, tx, ty) {
  if (sx === tx && sy === ty) return null;
  const q = [[sx, sy, null]];
  const visited = new Set([`${sx},${sy}`]);
  while (q.length) {
    const [x, y, first] = q.shift();
    for (const [dx, dy] of [[0,-1],[0,1],[-1,0],[1,0]]) {
      const nx = x+dx, ny = y+dy;
      const k = `${nx},${ny}`;
      if (nx<0||ny<0||nx>=COLS||ny>=ROWS||walls[ny][nx]||visited.has(k)) continue;
      const step = first ?? [nx, ny];
      if (nx===tx && ny===ty) return step;
      visited.add(k); q.push([nx, ny, step]);
    }
  }
  return null;
}

export default function PacMan() {
  const canvasRef = useRef(null);
  const gameRef = useRef(null);
  const keysRef = useRef({});
  const [ui, setUi] = useState({ score: 0, lives: 3, state: "playing" });

  useEffect(() => {
    const canvas = canvasRef.current;
    canvas.width = W; canvas.height = H;
    const ctx = canvas.getContext("2d");
    let animId, frameCount = 0;

    function mkState() {
      const { walls, pellets, total } = buildMaze();
      return {
        walls, pellets, totalPellets: total, score: 0, lives: 3,
        pac: { x:1, y:1, dx:0, dy:0, ndx:0, ndy:0, mouthAngle:0.2, mouthDir:1 },
        ghost: { x:COLS-2, y:ROWS-2, color:"#f87171" },
        state: "playing", moveTimer: 0, ghostTimer: 0,
      };
    }

    gameRef.current = mkState();

    function handleKey(e) {
      keysRef.current[e.key] = true;
      const s = gameRef.current;
      if (!s || s.state !== "playing") return;
      if (e.key==="ArrowLeft") { s.pac.ndx=-1; s.pac.ndy=0; }
      if (e.key==="ArrowRight") { s.pac.ndx=1;  s.pac.ndy=0; }
      if (e.key==="ArrowUp") { s.pac.ndx=0; s.pac.ndy=-1; }
      if (e.key==="ArrowDown") { s.pac.ndx=0;  s.pac.ndy=1; }
      if (e.key==="r"||e.key==="R") { gameRef.current=mkState(); setUi({score:0,lives:3,state:"playing"}); }
      e.preventDefault();
    }
    window.addEventListener("keydown", handleKey);

    function update() {
      const s = gameRef.current;
      if (!s || s.state !== "playing") return;
      frameCount++;

      // Pac-Man mouth
      s.pac.mouthAngle += 0.08 * s.pac.mouthDir;
      if (s.pac.mouthAngle > 0.35) s.pac.mouthDir = -1;
      if (s.pac.mouthAngle < 0.02) s.pac.mouthDir = 1;

      // Move pac every 5 frames
      s.moveTimer++;
      if (s.moveTimer >= 5) {
        s.moveTimer = 0;
        const { x, y, dx, dy, ndx, ndy } = s.pac;
        // Try new direction first
        let moved = false;
        for (const [ddx, ddy] of [[ndx,ndy],[dx,dy]]) {
          const nx=x+ddx, ny=y+ddy;
          if (nx>=0&&ny>=0&&nx<COLS&&ny<ROWS && !s.walls[ny][nx]) {
            s.pac.x=nx; s.pac.y=ny; s.pac.dx=ddx; s.pac.dy=ddy; moved=true; break;
          }
        }
        // Eat pellet
        if (s.pellets[s.pac.y][s.pac.x]) {
          s.pellets[s.pac.y][s.pac.x]=false;
          s.score+=10;
          setUi(u=>({...u, score:s.score}));
          if (s.pellets.flat().filter(Boolean).length===0) { s.state="win"; setUi(u=>({...u,state:"win"})); }
        }
      }

      // Ghost move every 15 frames
      s.ghostTimer++;
      if (s.ghostTimer >= 15) {
        s.ghostTimer=0;
        const step = bfs(s.walls, s.ghost.x, s.ghost.y, s.pac.x, s.pac.y);
        if (step) { s.ghost.x=step[0]; s.ghost.y=step[1]; }
      }

      // Collision
      if (s.ghost.x===s.pac.x && s.ghost.y===s.pac.y) {
        s.lives--;
        setUi(u=>({...u, lives:s.lives}));
        if (s.lives<=0) { s.state="dead"; setUi(u=>({...u,state:"dead"})); return; }
        s.pac={x:1,y:1,dx:0,dy:0,ndx:0,ndy:0,mouthAngle:0.2,mouthDir:1};
        s.ghost={x:COLS-2,y:ROWS-2,color:"#f87171"};
      }
    }

    function draw() {
      const s = gameRef.current;
      if (!s) return;
      ctx.fillStyle="#000"; ctx.fillRect(0,0,W,H);

      // Walls
      for (let r=0;r<ROWS;r++) for (let c=0;c<COLS;c++) {
        if (s.walls[r][c]) {
          ctx.fillStyle="#1d4ed8";
          ctx.fillRect(c*TILE,r*TILE,TILE,TILE);
          ctx.strokeStyle="#3b82f6"; ctx.lineWidth=1;
          ctx.strokeRect(c*TILE+0.5,r*TILE+0.5,TILE-1,TILE-1);
        }
      }
      // Pellets
      for (let r=0;r<ROWS;r++) for (let c=0;c<COLS;c++) {
        if (s.pellets[r][c]) {
          ctx.fillStyle="#fbbf24";
          ctx.beginPath();
          ctx.arc(c*TILE+TILE/2,r*TILE+TILE/2,4,0,Math.PI*2);
          ctx.fill();
        }
      }

      // Ghost
      const gx=s.ghost.x*TILE, gy=s.ghost.y*TILE;
      ctx.fillStyle=s.ghost.color;
      ctx.beginPath();
      ctx.arc(gx+TILE/2,gy+TILE/2-2,TILE/2-3,Math.PI,0);
      ctx.lineTo(gx+TILE-3,gy+TILE-3);
      for (let i=0;i<3;i++) {
        const wx=gx+3+(i*(TILE-6)/3);
        ctx.lineTo(wx+(TILE-6)/6,gy+TILE/2);
        ctx.lineTo(wx+(TILE-6)/3,gy+TILE-3);
      }
      ctx.closePath(); ctx.fill();
      ctx.fillStyle="#fff";
      ctx.beginPath(); ctx.arc(gx+TILE/2-4,gy+TILE/2-4,4,0,Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(gx+TILE/2+4,gy+TILE/2-4,4,0,Math.PI*2); ctx.fill();
      ctx.fillStyle="#3b82f6";
      ctx.beginPath(); ctx.arc(gx+TILE/2-4,gy+TILE/2-4,2,0,Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(gx+TILE/2+4,gy+TILE/2-4,2,0,Math.PI*2); ctx.fill();

      // Pac-Man
      const px=s.pac.x*TILE, py=s.pac.y*TILE;
      const angle=s.pac.mouthAngle*Math.PI;
      let startAngle=angle, endAngle=Math.PI*2-angle;
      if (s.pac.dx===0&&s.pac.dy===-1) { startAngle+=Math.PI*1.5; endAngle+=Math.PI*1.5; }
      else if (s.pac.dx===0&&s.pac.dy===1) { startAngle+=Math.PI*0.5; endAngle+=Math.PI*0.5; }
      else if (s.pac.dx===-1) { startAngle+=Math.PI; endAngle+=Math.PI; }
      ctx.fillStyle="#fbbf24";
      ctx.beginPath();
      ctx.moveTo(px+TILE/2,py+TILE/2);
      ctx.arc(px+TILE/2,py+TILE/2,TILE/2-3,startAngle,endAngle);
      ctx.closePath(); ctx.fill();
    }

    function loop() {
      update(); draw();
      animId=requestAnimationFrame(loop);
    }
    loop();
    return () => { cancelAnimationFrame(animId); window.removeEventListener("keydown",handleKey); };
  }, []);

  const restart = () => {
    gameRef.current = (() => {
      const { walls, pellets, total } = buildMaze();
      return {
        walls, pellets, totalPellets:total, score:0, lives:3,
        pac:{x:1,y:1,dx:0,dy:0,ndx:0,ndy:0,mouthAngle:0.2,mouthDir:1},
        ghost:{x:COLS-2,y:ROWS-2,color:"#f87171"},
        state:"playing", moveTimer:0, ghostTimer:0,
      };
    })();
    setUi({score:0,lives:3,state:"playing"});
  };

  return (
    <div style={{
      minHeight:"100vh", display:"flex", flexDirection:"column",
      alignItems:"center", justifyContent:"center",
      background:"#000", fontFamily:"'Segoe UI', sans-serif", padding:16,
    }}>
      <div style={{ display:"flex", gap:28, marginBottom:10, alignItems:"center" }}>
        <span style={{ color:"#fbbf24", fontWeight:700 }}>⭐ {ui.score}</span>
        <span style={{ color:"#fbbf24", fontSize:"1.3rem", letterSpacing:3, fontWeight:800 }}>PAC-MAN</span>
        <span style={{ color:"#f87171" }}>{Array.from({length:3},(_,i)=>i<ui.lives?"💛":"🖤").join("")}</span>
      </div>

      <div style={{ position:"relative" }}>
        <canvas ref={canvasRef} style={{ border:"2px solid #1d4ed8", borderRadius:4, display:"block" }} />

        {(ui.state==="dead"||ui.state==="win") && (
          <div style={{
            position:"absolute", inset:0, display:"flex", flexDirection:"column",
            alignItems:"center", justifyContent:"center",
            background:"rgba(0,0,0,0.82)", borderRadius:4,
          }}>
            <div style={{ fontSize:"3rem", marginBottom:8 }}>{ui.state==="win"?"🏆":"👻"}</div>
            <h2 style={{ color:ui.state==="win"?"#fbbf24":"#f87171", fontSize:"1.8rem", margin:"0 0 6px" }}>
              {ui.state==="win"?"You Win!":"Game Over"}
            </h2>
            <p style={{ color:"#94a3b8", marginBottom:16 }}>Score: {ui.score}</p>
            <button onClick={restart} style={{
              padding:"10px 28px", borderRadius:999, border:"none",
              background:"#fbbf24", color:"#000", fontWeight:800, cursor:"pointer",
            }}>🔄 Play Again</button>
          </div>
        )}
      </div>

      <p style={{ color:"#374151", fontSize:"0.8rem", marginTop:10 }}>
        Arrow keys to move · R to restart
      </p>
    </div>
  );
}
