'use client';
// Fry the Egg — two-player cook-off (React + three.js r128).
// Requires: npm i three@0.128.0
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

const CSS = `
.fte-root{color-scheme:dark;box-sizing:border-box;padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}
.fte-root *{margin:0;padding:0;box-sizing:border-box;-webkit-tap-highlight-color:transparent}
.fte-root{width:100%;height:100%;overflow:hidden;background:#17212c;font-family:'Segoe UI',system-ui,-apple-system,sans-serif;color:#fff;user-select:none}
.fte-root #app{position:absolute;inset:0}
.fte-root canvas{display:block;touch-action:none}
.fte-root #ui{position:absolute;inset:0;pointer-events:none;z-index:10;padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}
.fte-root #hud{position:absolute;top:14px;left:14px;right:14px;display:flex;align-items:flex-start;justify-content:space-between;text-align:left}
.fte-root #brand{display:flex;flex-direction:column;gap:4px}
.fte-root #title{display:flex;align-items:center;gap:10px;font-size:clamp(23px,2.5vw,31px);line-height:1.05;font-weight:900;letter-spacing:3px;color:#ffdc91;text-shadow:0 2px 0 rgba(0,0,0,.16)}
.fte-root #title .brand-icon{font-size:.88em;filter:drop-shadow(0 2px 3px rgba(0,0,0,.45))}
.fte-root #roundInfo{font-size:12px;font-weight:800;letter-spacing:2.2px;color:#bec8d4}
.fte-root #players{display:flex;gap:8px;justify-content:flex-end;margin:2px 0 0}
.fte-root .pl{min-width:132px;padding:8px 12px;border-radius:15px;border:1.5px solid rgba(255,255,255,.14);background:rgba(12,19,28,.88);display:flex;align-items:center;justify-content:space-between;gap:12px;font-size:12px;letter-spacing:1.5px;font-weight:900;color:#f0f3f7}
.fte-root .pl b{font-size:22px;line-height:1;color:#fff;margin:0}
.fte-root .pl.a{border-color:rgba(70,153,238,.7)}
.fte-root .pl.b{border-color:rgba(229,92,92,.72)}
.fte-root .pl.on.a{background:rgba(28,69,105,.82);box-shadow:0 0 16px rgba(79,163,255,.17)}
.fte-root .pl.on.b{background:rgba(105,39,43,.82);box-shadow:0 0 16px rgba(255,107,107,.15)}
.fte-root #status{position:absolute;top:14px;left:50%;transform:translateX(-50%);width:max-content;max-width:min(760px,88vw);padding:11px 18px;border-radius:14px;border:1px solid rgba(255,255,255,.24);background:rgba(15,23,33,.97);font-size:14px;line-height:1.45;text-align:center;color:#fff;box-shadow:0 8px 24px rgba(0,0,0,.28)}
.fte-root #status b{color:#ffd479}
.fte-root #bottomHud{position:absolute;left:14px;right:14px;bottom:8px;display:grid;grid-template-columns:minmax(0,1fr) 346px minmax(0,1fr);gap:10px;align-items:stretch}
.fte-root .player-card{min-width:0;min-height:124px;padding:10px 12px 9px;border-radius:17px;background:rgba(28,38,49,.96);backdrop-filter:blur(10px);display:flex;flex-direction:column;gap:6px}
.fte-root #panel{border:1.5px solid #468ed0;box-shadow:inset 0 0 0 1px rgba(70,142,208,.08)}
.fte-root #p2Panel{border:1.5px solid #b84b55;box-shadow:inset 0 0 0 1px rgba(184,75,85,.08)}
.fte-root .player-card.active{background:rgba(28,41,54,.98)}
.fte-root .card-top{display:flex;justify-content:space-between;align-items:center;gap:8px;min-height:18px;font-size:11px;font-weight:900;letter-spacing:1.8px}
.fte-root .player-blue{color:#79baf2}
.fte-root .player-red{color:#ff8589}
.fte-root .outcome{color:#aab6c5;font-size:10px;letter-spacing:1.4px;white-space:nowrap}
.fte-root .cook-label{font-size:10.5px;color:#aeb9c8;letter-spacing:.2px;margin-top:1px}
.fte-root #barWrap,.fte-root .progress-track{position:relative;height:10px;min-height:10px;margin-top:0;border-radius:9px;overflow:hidden;border:1px solid rgba(255,255,255,.10);background:linear-gradient(90deg,#fff5d7 0%,#ffe6a3 25%,#ffc04f 53%,#ed7131 76%,#6f241c 100%)}
.fte-root #perfectZone,.fte-root #marker{display:none}
.fte-root .progress-track{background:linear-gradient(90deg,#fff5d7 0%,#ffe6a3 25%,#ffc04f 53%,#ed7131 76%,#6f241c 100%)}
.fte-root .action-row{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:7px;margin-top:2px}
.fte-root .action-btn{height:38px;min-width:0;border-radius:11px;border:1px solid rgba(255,255,255,.08);background:#222e3a;color:#8994a1;font-size:11px;font-weight:900;letter-spacing:1px;text-transform:uppercase;pointer-events:auto;transition:background .15s,border-color .15s,transform .15s,color .15s}
.fte-root .action-btn:active:not(:disabled){transform:translateY(1px)}
.fte-root .action-btn:disabled{opacity:.48;cursor:default}
.fte-root .action-btn.heat{color:#b9c8d9}
.fte-root #panel .action-btn.primary{background:#244b69;border-color:#38698f;color:#e7f4ff}
.fte-root #p2Panel .action-btn.primary{background:#57363d;border-color:#8b4c55;color:#ffe9e9}
.fte-root #eggLegend{min-width:0;align-self:end;height:53px;border:1px solid rgba(255,255,255,.13);border-radius:14px;background:rgba(39,47,55,.94);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;text-align:center;padding:5px 8px}
.fte-root #eggLegend .legend-title{font-size:13px;font-weight:900;letter-spacing:1.4px;color:#ffd785}
.fte-root #eggLegend .legend-sub{font-size:10.5px;color:#d2c2a5;letter-spacing:.1px}
.fte-root button{font-family:inherit;cursor:pointer;pointer-events:auto}
.fte-root #result{position:absolute;inset:0;display:none;align-items:center;justify-content:center;background:rgba(6,8,12,.72);backdrop-filter:blur(6px);pointer-events:auto;z-index:20}
.fte-root #result.show{display:flex}
.fte-root #resultCard{width:min(400px,88vw);text-align:center;padding:36px 28px 30px;background:#1a1d25;border:1px solid rgba(255,255,255,.12);border-radius:22px}
.fte-root #resultEmoji{font-size:56px;line-height:1}
.fte-root #resultVerdict{margin-top:12px;font-size:26px;font-weight:900;letter-spacing:3px}
.fte-root #resultDesc{margin-top:10px;font-size:13.5px;line-height:1.6;color:#9aa3b2}
.fte-root #resultTime{margin-top:6px;font-size:11px;letter-spacing:1.5px;color:#5d6675}
.fte-root #againBtn{margin-top:24px;padding:13px 36px;border-radius:40px;border:1px solid rgba(120,255,170,.45);background:rgba(90,255,160,.15);color:#8dffbb;font-size:13px;font-weight:800;letter-spacing:2.5px}
.fte-root #serveBtn:disabled,.fte-root #serveBtn2:disabled{opacity:.38}
@media (max-width:1050px){.fte-root #bottomHud{grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:8px}
.fte-root #eggLegend{position:absolute;left:50%;bottom:calc(100% + 8px);transform:translateX(-50%);width:min(330px,48vw)}
.fte-root .player-card{min-height:116px;padding:9px}
.fte-root .pl{min-width:112px;padding:7px 10px;font-size:10px}
.fte-root .pl b{font-size:19px}}
@media (max-width:620px){.fte-root #status{top:8px;max-width:94vw;padding:9px 11px;font-size:12px;border-radius:10px}
.fte-root #bottomHud{left:7px;right:7px;bottom:7px;gap:6px}
.fte-root .player-card{min-height:105px;padding:7px;border-radius:12px;gap:5px}
.fte-root .card-top{font-size:8px;letter-spacing:.9px}
.fte-root .outcome{font-size:7px;letter-spacing:.5px}
.fte-root .cook-label{font-size:8.5px}
.fte-root .action-row{gap:4px}
.fte-root .action-btn{height:34px;border-radius:8px;font-size:8px;letter-spacing:.3px}
.fte-root #eggLegend{width:min(280px,72vw);height:44px;bottom:calc(100% + 6px);border-radius:10px}
.fte-root #eggLegend .legend-title{font-size:10px}
.fte-root .legend-sub{font-size:8px!important}}
.fte-root #app{display:none}
.fte-root #ui{display:none}
.fte-root .pre-screen{position:absolute;inset:0;z-index:50;display:none;align-items:center;justify-content:center;padding:22px;overflow:auto;background:radial-gradient(ellipse at 50% 0%,#42505b 0%,#202c37 48%,#111a22 100%);}
.fte-root .pre-screen.active{display:flex}
.fte-root .pre-card{width:min(760px,100%);padding:clamp(24px,5vw,52px);border:1px solid rgba(255,228,182,.22);border-radius:30px;background:linear-gradient(145deg,rgba(47,59,68,.97),rgba(25,33,42,.98));box-shadow:0 30px 90px rgba(0,0,0,.38),inset 0 1px 0 rgba(255,255,255,.07);text-align:center;}
.fte-root .splash-card{max-width:780px}
.fte-root .hero-egg{font-size:clamp(58px,9vw,88px);line-height:1;margin-bottom:12px;filter:drop-shadow(0 8px 14px rgba(0,0,0,.28))}
.fte-root .eyebrow{font-size:11px;font-weight:900;letter-spacing:4px;color:#f3c978}
.fte-root .pre-card h1{margin-top:8px;font-size:clamp(42px,8vw,72px);line-height:.98;font-weight:1000;letter-spacing:3px;color:#ffdc91;text-shadow:0 4px 0 #8a542e,0 9px 24px rgba(0,0,0,.24)}
.fte-root .pre-card h2{margin-top:10px;font-size:clamp(29px,5vw,44px);font-weight:950;letter-spacing:2px;color:#ffdc91}
.fte-root .pre-subtitle{margin:14px auto 0;color:#cbd3dc;font-size:clamp(13px,2vw,16px);line-height:1.55;max-width:520px}
.fte-root .how-to-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin:34px 0 26px;text-align:left}
.fte-root .how-to-grid>div{min-height:118px;padding:16px 14px;border-radius:16px;background:rgba(8,14,20,.32);border:1px solid rgba(255,255,255,.09)}
.fte-root .how-to-grid span{display:block;color:#f0bc62;font-size:12px;font-weight:950;letter-spacing:2px}
.fte-root .how-to-grid b{display:block;margin-top:9px;color:#fff;font-size:11px;letter-spacing:1.2px}
.fte-root .how-to-grid small{display:block;margin-top:6px;color:#abb7c3;font-size:11px;line-height:1.4}
.fte-root .big-button{display:flex;align-items:center;justify-content:center;gap:18px;width:min(360px,100%);min-height:58px;margin:0 auto;border:1px solid #ffdf9b;border-radius:16px;background:linear-gradient(180deg,#ffd987,#e7a94e);color:#382616;font-size:14px;font-weight:1000;letter-spacing:2px;box-shadow:0 8px 0 #9e6937,0 14px 24px rgba(0,0,0,.22);transition:transform .15s,filter .15s}
.fte-root .big-button span{font-size:23px;line-height:0}
.fte-root .big-button:active{transform:translateY(4px);box-shadow:0 4px 0 #9e6937,0 8px 15px rgba(0,0,0,.2)}
.fte-root .pre-foot{margin-top:28px;color:#8998a6;font-size:9px;font-weight:800;letter-spacing:2px}
.fte-root .setup-card{max-width:590px;text-align:left}
.fte-root .setup-card .eyebrow,.fte-root .setup-card h2,.fte-root .setup-card .pre-subtitle{text-align:center}
.fte-root .setup-card .pre-subtitle{margin-bottom:28px}
.fte-root .player-input-row{display:grid;grid-template-columns:48px 1fr;gap:4px 12px;align-items:center;margin:14px 0;padding:15px;border:1px solid rgba(255,255,255,.1);border-radius:16px;background:rgba(9,15,21,.28)}
.fte-root .input-icon{grid-row:1/3;grid-column:1;font-size:27px;text-align:center}
.fte-root .player-input-row label{grid-column:2;color:#dce5ee;font-size:11px;font-weight:950;letter-spacing:1.7px}
.fte-root .player-input-row label span{margin-left:6px;color:#91a1b1;font-size:9px}
.fte-root .player-input-row input{grid-column:2;width:100%;height:39px;padding:0 12px;border:1px solid rgba(255,255,255,.14);border-radius:9px;outline:none;background:#17232d;color:#fff;font:600 14px system-ui,sans-serif;}
.fte-root .player-input-row input:focus{border-color:#f5c66f;box-shadow:0 0 0 3px rgba(245,198,111,.12)}
.fte-root .setup-note{margin:20px 0 24px;text-align:center;color:#aeb9c4;font-size:11px;line-height:1.5}
.fte-root .text-button{display:block;margin:20px auto 0;border:0;background:transparent;color:#aeb9c4;font-size:10px;font-weight:900;letter-spacing:2px}
.fte-root #bottomHud{grid-template-columns:minmax(0,1fr) minmax(300px,360px) minmax(0,1fr);align-items:end}
.fte-root .player-card{min-height:112px;padding:12px 13px 10px;gap:8px}
.fte-root #panel{border:1.5px solid rgba(81,166,244,.75)}
.fte-root #p2Panel{border:1.5px solid rgba(239,104,112,.75)}
.fte-root .player-card.active{box-shadow:0 0 0 2px rgba(255,216,145,.18),0 8px 22px rgba(0,0,0,.15)}
.fte-root .progress-track{position:relative;height:12px;min-height:12px;background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.16);overflow:hidden}
.fte-root .perfect-zone{position:absolute;z-index:0;right:0;top:0;bottom:0;width:14%;background:rgba(116,221,135,.24);border-left:1px solid rgba(170,255,180,.72)}
.fte-root .cook-fill{position:relative;z-index:1;height:100%;width:0%;border-radius:9px;background:linear-gradient(90deg,#a7d9ff,#529ce1);transition:width .42s cubic-bezier(.2,.75,.25,1),background .35s ease}
.fte-root .red-fill{background:linear-gradient(90deg,#ffc1bb,#d65e68)}
.fte-root .cook-fill.burnt-fill{background:linear-gradient(90deg,#b66a39,#3b1a13)!important}
.fte-root .progress-scale{display:flex;justify-content:space-between;gap:6px;color:#aeb9c8;font-size:8px;font-weight:900;letter-spacing:.65px;line-height:1}
.fte-root .progress-scale span:last-child{color:#9ee3a9}
.fte-root .state-caption{font-size:10px;color:#aeb9c8;letter-spacing:.25px}
.fte-root #eggLegend{height:auto;min-height:112px;align-self:stretch;padding:10px 12px 11px;gap:3px;background:rgba(26,35,44,.97);border:1px solid rgba(255,255,255,.14)}
.fte-root #eggLegend .legend-title{font-size:13px}
.fte-root #eggLegend .legend-sub{font-size:9.5px;color:#aeb9c8}
.fte-root #crateChoiceButtons{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:5px;width:100%;margin-top:7px}
.fte-root .crate-choice{height:28px;border:1px solid rgba(255,221,160,.32);border-radius:8px;background:linear-gradient(180deg,#b77b40,#80502d);color:#fff1d6;font-size:11px;font-weight:950;box-shadow:inset 0 1px 0 rgba(255,255,255,.15);transition:transform .12s,opacity .12s,filter .12s}
.fte-root .crate-choice:active:not(:disabled){transform:translateY(1px)}
.fte-root .crate-choice:hover:not(:disabled){filter:brightness(1.2)}
.fte-root .crate-choice:disabled{opacity:.2;filter:grayscale(1);cursor:default}
.fte-root #status{z-index:5}
.fte-root #resultCard{box-shadow:0 20px 60px rgba(0,0,0,.32)}
.fte-root #againBtn{display:block;width:100%;}
.fte-root .result-home{margin-top:13px;padding:8px 16px;border:0;background:transparent;color:#aeb9c8;font-size:10px;font-weight:900;letter-spacing:1.5px}
@media(max-width:900px){.fte-root #bottomHud{grid-template-columns:minmax(0,1fr) minmax(240px,290px) minmax(0,1fr);gap:7px}
.fte-root .player-card{padding:9px;min-height:105px}
.fte-root #eggLegend{padding:8px}
.fte-root #crateChoiceButtons{gap:4px}
.fte-root .crate-choice{height:26px}
.fte-root .card-top{font-size:9px;letter-spacing:1px}}
@media(max-width:620px){.fte-root #hud{top:8px;left:8px;right:8px}
.fte-root #title{font-size:17px;letter-spacing:1.2px}
.fte-root #roundInfo{font-size:8px;letter-spacing:.8px}
.fte-root .pl{padding:6px 7px;font-size:8px;gap:5px}
.fte-root .pl b{font-size:14px}
.fte-root #status{top:67px;max-width:94vw;font-size:9px;padding:7px 9px}
.fte-root #bottomHud{left:7px;right:7px;bottom:7px;grid-template-columns:1fr 1fr;gap:6px;align-items:stretch}
.fte-root .player-card{min-height:88px;padding:7px;border-radius:11px;gap:4px}
.fte-root .card-top{font-size:7px;letter-spacing:.5px;min-height:14px}
.fte-root .outcome{font-size:7px;letter-spacing:0}
.fte-root .cook-label{font-size:8px;margin-top:0}
.fte-root .progress-track{height:8px;min-height:8px}
.fte-root .state-caption{font-size:7px}
.fte-root #eggLegend{position:absolute;left:50%;bottom:calc(100% + 7px);transform:translateX(-50%);width:min(300px,90vw);min-height:0;height:auto;padding:7px 9px;border-radius:11px}
.fte-root #eggLegend .legend-title{font-size:10px}
.fte-root #eggLegend .legend-sub{font-size:8px}
.fte-root #crateChoiceButtons{grid-template-columns:repeat(6,minmax(0,1fr));gap:4px;margin-top:5px}
.fte-root .crate-choice{height:23px;border-radius:6px;font-size:9px}
.fte-root .pre-screen{padding:12px}
.fte-root .pre-card{padding:26px 19px;border-radius:22px}
.fte-root .how-to-grid{gap:6px;margin:25px 0 23px}
.fte-root .how-to-grid>div{min-height:112px;padding:11px 8px}
.fte-root .how-to-grid b{font-size:9px;letter-spacing:.5px}
.fte-root .how-to-grid small{font-size:9px}
.fte-root .player-input-row{padding:12px;grid-template-columns:36px 1fr}}
@media(max-height:640px) and (min-width:621px){.fte-root #bottomHud{bottom:5px}
.fte-root .player-card,.fte-root #eggLegend{min-height:88px}
.fte-root .pre-card{padding:22px 32px}
.fte-root .how-to-grid{margin:19px 0 17px}}
.fte-root{position:relative;isolation:isolate;z-index:0;display:flex;flex:1 1 auto;min-width:0;min-height:0;width:100%;height:100%;overflow:hidden}
`;

export default function FryTheEgg({ onHudUpdate }) {
  const rootRef = useRef(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;
    let disposed = false, raf = 0;
    const offs = [];
    const on = (t, ev, fn, o) => { t.addEventListener(ev, fn, o); offs.push(() => t.removeEventListener(ev, fn, o)); };

    const app=root.querySelector('#app');
    const renderer=new THREE.WebGLRenderer({antialias:true});
    renderer.setPixelRatio(Math.min(devicePixelRatio,2));
    const playWidth=()=>Math.max(1,root.clientWidth);
    const playHeight=()=>Math.max(1,root.clientHeight);
    renderer.setSize(playWidth(),playHeight());
    renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
    renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.1;
    app.appendChild(renderer.domElement);
    const scene=new THREE.Scene();scene.background=new THREE.Color(0x17212c);scene.fog=new THREE.Fog(0x17212c,18,42);
    const camera=new THREE.PerspectiveCamera(42,playWidth()/playHeight(),.1,120);
    const CAM_BASE=new THREE.Vector3(0,7.8,9.6),CAM_LOOK=new THREE.Vector3(0,0,-2.6);
    let PLAYER1_X=-4.35,player1Station=null,player2Station=null;
    function resizeRenderer(){const width=playWidth(),height=playHeight();renderer.setSize(width,height);const a=width/height,portrait=a<.8;camera.aspect=a;camera.fov=portrait?72:42;CAM_BASE.set(0,portrait?13.5:7.8,portrait?16.5:9.6);CAM_LOOK.set(0,0,portrait?-2.0:-2.6);PLAYER1_X=-(portrait?1.65:4.35);if(player1Station)player1Station.position.x=PLAYER1_X;if(player2Station)player2Station.position.x=-PLAYER1_X;camera.updateProjectionMatrix()}
    function fitCam(){resizeRenderer()}
    fitCam();

    scene.add(new THREE.HemisphereLight(0x93b7ff,0x1a120c,.8));
    const key=new THREE.DirectionalLight(0xfff0d8,1.4);key.position.set(5,9,6);key.castShadow=true;
    key.shadow.mapSize.set(2048,2048);Object.assign(key.shadow.camera,{left:-9,right:9,top:9,bottom:-9,near:1,far:36});key.shadow.bias=-.0006;scene.add(key);
    const rim=new THREE.DirectionalLight(0x6f8cff,.8);rim.position.set(-6,4,-7);scene.add(rim);
    const flameLight=new THREE.PointLight(0xff8a3a,0,8,2);

    const M=(c,r,m,x)=>new THREE.MeshStandardMaterial(Object.assign({color:c,roughness:r,metalness:m},x||{}));
    function mesh(g,m,p,sh){const o=new THREE.Mesh(g,m);if(p)o.position.set(...p);o.castShadow=true;o.receiveShadow=true;return o}
    const counter=mesh(new THREE.BoxGeometry(20.5,1,21.5),M(0x82909d,.76,.08),[0,-.5,-4]);scene.add(counter);
    scene.add(mesh(new THREE.BoxGeometry(20.08,.08,21.08),M(0xd7c5b0,.92,0),[0,.02,-4]));
    player1Station=new THREE.Group();player1Station.position.set(PLAYER1_X,0,0);scene.add(player1Station);
    player1Station.add(mesh(new THREE.BoxGeometry(5.4,.18,4.4),M(0x3c4b60,.48,.32),[0,.09,0]));
    const accent1=mesh(new THREE.BoxGeometry(5.35,.075,.11),M(0x91d9ec,.35,.18),[0,.205,2.15]);accent1.userData.isAccent=true;player1Station.add(accent1);
    const burnerMat=M(0x3a3d44,.55,.85);
    player1Station.add(mesh(new THREE.CylinderGeometry(.6,.7,.06,40),burnerMat,[0,.21,0]));
    player1Station.add(mesh(new THREE.CylinderGeometry(.3,.34,.05,32),burnerMat,[0,.255,0]));
    const grateMat=M(0x15171b,.5,.9);
    for(let i=0;i<4;i++){const a=Math.PI/4+i*Math.PI/2;const arm=mesh(new THREE.BoxGeometry(.92,.06,.13),grateMat,[Math.cos(a)*.7,.3,Math.sin(a)*.7]);arm.rotation.y=-a;player1Station.add(arm)}
    const ring=mesh(new THREE.TorusGeometry(1.16,.032,8,56),grateMat,[0,.3,0]);ring.rotation.x=Math.PI/2;player1Station.add(ring);

    const knobGroup=new THREE.Group();knobGroup.name='knobGroup';knobGroup.position.set(-2,.18,1.55);player1Station.add(knobGroup);
    const knobMesh=mesh(new THREE.CylinderGeometry(.21,.23,.14,28),M(0x2b2f36,.35,.9),[0,.07,0]);knobMesh.name='knobMesh';knobGroup.add(knobMesh);
    const pointer=new THREE.Mesh(new THREE.BoxGeometry(.15,.03,.045),M(0xffcf6b,.5,0,{emissive:0xff9d20,emissiveIntensity:.7}));pointer.position.set(.085,.145,0);knobMesh.add(pointer);
    const knobHit=new THREE.Mesh(new THREE.CylinderGeometry(.45,.45,.4,12),new THREE.MeshBasicMaterial({visible:false}));knobHit.position.y=.12;knobGroup.add(knobHit);

    const panGroup=new THREE.Group();panGroup.name='panGroup';panGroup.position.set(0,.33,0);player1Station.add(panGroup);
    const panMat=M(0x24262b,.38,.9,{side:THREE.DoubleSide});
    panGroup.add(mesh(new THREE.CylinderGeometry(1.2,.95,.42,56,1,true),panMat,[0,.21,0]));
    panGroup.add(mesh(new THREE.CylinderGeometry(.955,.955,.08,56),panMat,[0,.04,0]));
    const rimM=mesh(new THREE.TorusGeometry(1.2,.035,8,64),panMat,[0,.42,0]);rimM.rotation.x=Math.PI/2;panGroup.add(rimM);
    const handle=mesh(new THREE.CylinderGeometry(.055,.075,1.05,14),M(0x15171a,.65,.5),[1.7,.36,0]);handle.rotation.z=-Math.PI/2;panGroup.add(handle);
    panGroup.add(mesh(new THREE.BoxGeometry(.22,.1,.16),panMat,[1.22,.38,0]));

    const EGG_Y=.125;const eggGroup=new THREE.Group();eggGroup.name='eggGroup';eggGroup.position.y=EGG_Y;panGroup.add(eggGroup);
    const pts=[];for(let i=0;i<40;i++){const a=i/40*Math.PI*2;const r=.62+.085*Math.sin(a*3+.7)+.055*Math.sin(a*5+2.1)+.035*Math.sin(a*7+4.3);pts.push(new THREE.Vector2(Math.cos(a)*r,Math.sin(a)*r))}
    const wg=new THREE.ExtrudeGeometry(new THREE.Shape(pts),{depth:.05,bevelEnabled:true,bevelThickness:.02,bevelSize:.03,bevelSegments:3,curveSegments:1});
    wg.translate(0,0,-.025);wg.rotateX(-Math.PI/2);
    const whiteMat=new THREE.MeshPhysicalMaterial({color:0xdfe6cf,roughness:.2,metalness:0,transparent:true,opacity:.6,clearcoat:.8,clearcoatRoughness:.15});
    eggGroup.add(mesh(wg,whiteMat));const crispMat=new THREE.MeshStandardMaterial({color:0x8a5423,roughness:.8,transparent:true,opacity:0});const crisp=new THREE.Mesh(wg,crispMat);crisp.scale.set(1.06,.7,1.06);crisp.position.y=-.012;crisp.receiveShadow=true;eggGroup.add(crisp);
    const yolkMat=new THREE.MeshPhysicalMaterial({color:0xffc93c,roughness:.12,metalness:0,clearcoat:1,clearcoatRoughness:.05});
    const yolk=mesh(new THREE.SphereGeometry(.26,32,24),yolkMat,[.05,.02,.03]);yolk.scale.set(1,.5,1);eggGroup.add(yolk);const oil=new THREE.Mesh(new THREE.CircleGeometry(.93,48),new THREE.MeshPhysicalMaterial({color:0xe8b64a,roughness:.05,transparent:true,opacity:.35,clearcoat:1}));oil.rotation.x=-Math.PI/2;oil.position.y=.082;panGroup.add(oil);

    const flameGroup=new THREE.Group();flameGroup.name='flameGroup';flameGroup.position.set(0,.245,0);player1Station.add(flameGroup);
    const jets=[];
    for(let i=0;i<14;i++){const a=i/14*Math.PI*2;const g=new THREE.ConeGeometry(.072,1,8,1,true);g.translate(0,.5,0);
    const m=new THREE.MeshBasicMaterial({color:0x5aa8ff,transparent:true,opacity:.85,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide});
    const j=new THREE.Mesh(g,m);j.position.set(Math.cos(a)*.62,0,Math.sin(a)*.62);j.rotation.x=Math.sin(a)*.6;j.rotation.z=-Math.cos(a)*.6;flameGroup.add(j);jets.push({mesh:j,phase:Math.random()*12})}
    const cg=new THREE.ConeGeometry(.26,1,16,1,true);cg.translate(0,.5,0);
    const flameCore=new THREE.Mesh(cg,new THREE.MeshBasicMaterial({color:0xcfe6ff,transparent:true,opacity:.55,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide}));flameGroup.add(flameCore);
    const glowMat=new THREE.MeshBasicMaterial({color:0xff7a20,transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false});
    const flameGlow=new THREE.Mesh(new THREE.CircleGeometry(1.15,40),glowMat);flameGlow.name='flameGlow';flameGlow.rotation.x=-Math.PI/2;flameGlow.position.y=.22;player1Station.add(flameGlow);
    flameLight.name='flameLight';player1Station.add(flameLight);
    flameGroup.visible=false;
    player2Station=player1Station.clone(true);player2Station.position.set(-PLAYER1_X,0,0);player2Station.rotation.y=Math.PI;player2Station.traverse(o=>{if(o.userData&&o.userData.isAccent)o.material=M(0xe9a1ac,.35,.18)});scene.add(player2Station);
    const player2EggGroup=player2Station.getObjectByName('eggGroup');
    const p2White=player2EggGroup.children[0],p2Crisp=player2EggGroup.children[1],p2Yolk=player2EggGroup.children[2];
    [p2White,p2Crisp,p2Yolk].forEach(o=>{o.material=o.material.clone()});
    const eggFlips=[null,null];
    const flameGroup2=player2Station.getObjectByName('flameGroup'),flameGlow2=player2Station.getObjectByName('flameGlow'),flameLight2=player2Station.getObjectByName('flameLight');
    const jets2=flameGroup2.children.slice(0,14),flameCore2=flameGroup2.children[14],knobMesh2=player2Station.getObjectByName('knobMesh');

    const VS=`attribute float aSize;attribute float aAlpha;attribute vec3 aColor;varying float vA;varying vec3 vC;
    void main(){vA=aAlpha;vC=aColor;vec4 mv=modelViewMatrix*vec4(position,1.0);gl_PointSize=aSize*(260.0/max(.001,-mv.z));gl_Position=projectionMatrix*mv;}`;
    const FS=`varying float vA;varying vec3 vC;void main(){float d=length(gl_PointCoord-vec2(.5));if(d>.5)discard;gl_FragColor=vec4(vC,smoothstep(.5,.06,d)*vA);}`;
    class Particles{
      constructor(n,blending,gravity){this.n=n;this.g=gravity;this.c=0;
        this.pos=new Float32Array(n*3);this.vel=new Float32Array(n*3);this.col=new Float32Array(n*3);
        this.siz=new Float32Array(n);this.alp=new Float32Array(n);this.life=new Float32Array(n);this.max=new Float32Array(n);
        const geo=new THREE.BufferGeometry();
        geo.setAttribute('position',new THREE.BufferAttribute(this.pos,3));geo.setAttribute('aColor',new THREE.BufferAttribute(this.col,3));
        geo.setAttribute('aSize',new THREE.BufferAttribute(this.siz,1));geo.setAttribute('aAlpha',new THREE.BufferAttribute(this.alp,1));
        this.geo=geo;this.points=new THREE.Points(geo,new THREE.ShaderMaterial({vertexShader:VS,fragmentShader:FS,transparent:true,depthWrite:false,blending}));
        this.points.frustumCulled=false;scene.add(this.points)}
      spawn(x,y,z,vx,vy,vz,s,l,r,g,b){const i=this.c;this.c=(i+1)%this.n;
        this.pos.set([x,y,z],i*3);this.vel.set([vx,vy,vz],i*3);this.col.set([r,g,b],i*3);this.siz[i]=s;this.life[i]=this.max[i]=l;this.alp[i]=1}
      update(dt){for(let i=0;i<this.n;i++){if(this.life[i]>0){this.life[i]-=dt;if(this.life[i]<=0){this.alp[i]=0;continue}
        const f=this.life[i]/this.max[i];for(let k=0;k<3;k++)this.pos[i*3+k]+=this.vel[i*3+k]*dt;
        this.vel[i*3]*=1-1.6*dt;this.vel[i*3+2]*=1-1.6*dt;this.vel[i*3+1]+=this.g*dt;this.alp[i]=f*f}}
        for(const k of['position','aAlpha','aSize','aColor'])this.geo.attributes[k].needsUpdate=true}
      clear(){this.life.fill(0);this.alp.fill(0);this.geo.attributes.aAlpha.needsUpdate=true}
    }
    const sparks=new Particles(260,THREE.AdditiveBlending,-3.4),smoke=new Particles(180,THREE.NormalBlending,.55);

    let actx=null,sizzleGain=null,bgSizzle=null,masterOut=null,muted=false;
    function initAudio(){if(actx){if(actx.state==='suspended')actx.resume();return}
      try{actx=new(window.AudioContext||window.webkitAudioContext)()}catch(e){return}
      masterOut=actx.createGain();masterOut.gain.value=muted?0:1;masterOut.connect(actx.destination);
      const len=actx.sampleRate*2,buf=actx.createBuffer(1,len,actx.sampleRate),d=buf.getChannelData(0);
      for(let i=0;i<len;i++)d[i]=Math.random()*2-1;
      const src=actx.createBufferSource();src.buffer=buf;src.loop=true;
      const hp=actx.createBiquadFilter();hp.type='highpass';hp.frequency.value=1000;
      const bp=actx.createBiquadFilter();bp.type='bandpass';bp.frequency.value=3000;bp.Q.value=.7;
      sizzleGain=actx.createGain();sizzleGain.gain.value=0;
      src.connect(hp);hp.connect(bp);bp.connect(sizzleGain);sizzleGain.connect(masterOut);bgSizzle=actx.createGain();bgSizzle.gain.value=0;bp.connect(bgSizzle);bgSizzle.connect(masterOut);src.start()}
    function blip(f,dur,type='sine',vol=.12,f2){if(!actx||muted)return;const o=actx.createOscillator(),g=actx.createGain(),t=actx.currentTime;
      o.type=type;o.frequency.setValueAtTime(f,t);if(f2)o.frequency.exponentialRampToValueAtTime(f2,t+dur*.8);
      g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(.0001,t+dur);o.connect(g);g.connect(masterOut);o.start();o.stop(t+dur+.02)}

    const crateGroup=new THREE.Group();crateGroup.position.set(0,0,-3.9);scene.add(crateGroup);
    const woodMat=M(0x9a6530,.85,0);
    crateGroup.add(mesh(new THREE.BoxGeometry(3.7,.1,2.9),woodMat,[0,.05,0]));
    [[0,.22,1.45,3.7,.44,.1],[0,.22,-1.45,3.7,.44,.1],[1.85,.22,0,.1,.44,2.9],[-1.85,.22,0,.1,.44,2.9]].forEach(w=>crateGroup.add(mesh(new THREE.BoxGeometry(w[3],w[4],w[5]),woodMat,[w[0],w[1],w[2]])));
    const crateEggs=[],crateLabels=[],eggGeo=new THREE.SphereGeometry(.2,24,18),pops=[],TOTAL=12;
    let revealed=0,hoverI=-1;
    function makeNumberBadge(n){const cv=document.createElement('canvas');cv.width=cv.height=128;const c=cv.getContext('2d');c.beginPath();c.arc(64,64,50,0,Math.PI*2);c.fillStyle='#eee8dc';c.fill();c.lineWidth=5;c.strokeStyle='#b48c5a';c.stroke();c.fillStyle='#7a654d';c.font='bold 47px Segoe UI, sans-serif';c.textAlign='center';c.textBaseline='middle';c.fillText(String(n),64,66);const tex=new THREE.CanvasTexture(cv);tex.anisotropy=4;const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:tex,transparent:true,depthWrite:false}));sp.scale.set(.31,.31,1);return sp}
    function buildCrate(){
     crateEggs.forEach(e=>crateGroup.remove(e));crateLabels.forEach(e=>crateGroup.remove(e));crateEggs.length=0;crateLabels.length=0;revealed=0;
     // Ten cooking boosts and two cooling setbacks. The hidden values are shuffled each round.
     const deck=[18,20,22,24,26,18,20,22,24,26,-8,-12].map(delta=>({delta,icon:delta>0?'🔥':'❄️'}));
     for(let i=deck.length-1;i>0;i--){const j=Math.random()*(i+1)|0;[deck[i],deck[j]]=[deck[j],deck[i]]}
     deck.forEach((d,i)=>{const mt=M(0xf3ead6,.45,0);mt.color.offsetHSL(0,0,(Math.random()-.5)*.08);const m=new THREE.Mesh(eggGeo,mt);m.scale.set(1,1.3,1);m.position.set((i%4-1.5)*.68,.36,((i/4|0)-1)*.72);m.rotation.set((Math.random()-.5)*.2,Math.random()*6,(Math.random()-.5)*.2);m.castShadow=true;m.userData={i,d,a:-1};crateGroup.add(m);crateEggs.push(m);const badge=makeNumberBadge(i+1);badge.position.set(m.position.x,.66,m.position.z);badge.renderOrder=8;crateGroup.add(badge);crateLabels.push(badge);m.userData.badge=badge});
     renderCrateButtons();
    }
    function renderCrateButtons(){const wrap=$('crateChoiceButtons');if(!wrap)return;wrap.innerHTML='';for(let i=0;i<TOTAL;i++){const b=document.createElement('button');b.type='button';b.className='crate-choice';b.textContent=String(i+1);b.setAttribute('aria-label','Choose egg '+(i+1));b.disabled=!!(crateEggs[i]&&crateEggs[i].userData.a>=0)||gameOver||locked;b.addEventListener('click',()=>{initAudio();pickEgg(i)});wrap.appendChild(b)}}
    function popEmoji(txt,p){const cv=document.createElement('canvas');cv.width=cv.height=128;const x=cv.getContext('2d');x.font='96px serif';x.textAlign='center';x.textBaseline='middle';x.fillText(txt,64,70);const s=new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(cv),transparent:true,depthTest:false}));s.scale.set(.8,.8,1);s.position.set(p.x,.9,p.z-3.9);s.renderOrder=9;scene.add(s);pops.push({s,t:0})}
    function syncControls(){$('panel').classList.toggle('active',cur===0&&!gameOver);$('p2Panel').classList.toggle('active',cur===1&&!gameOver)}
    function renderScores(){syncControls();notifyHud()}
    function setStatus(t){$('status').innerHTML=t;notifyHud()}
    function resetEggLooks(){
     [eggGroup,player2EggGroup].forEach(g=>{const w=g.children[0],c=g.children[1],y=g.children[2];w.material.color.setHex(0xdfe6cf);w.material.opacity=.72;w.material.roughness=.28;c.material.color.setHex(0x8a5423);c.material.opacity=0;y.material.color.setHex(0xffc93c);y.material.roughness=.16;y.scale.set(1,.5,1);g.visible=true;g.rotation.set(0,0,0);g.scale.set(1,1,1)});
    }
    function styleEggForProgress(player,amount){
     const group=player===0?eggGroup:player2EggGroup,w=group.children[0],c=group.children[1],y=group.children[2];
     const p=Math.max(0,Math.min(135,amount)),ready=Math.min(1,p/100),burnt=Math.max(0,Math.min(1,(p-100)/35));
     const underColor=new THREE.Color(0xe7eee0),readyColor=new THREE.Color(0xfff5dc),burntColor=new THREE.Color(0x63301a);
     const whiteColor=readyColor.clone().lerp(burntColor,burnt);if(p<100)whiteColor.copy(underColor).lerp(readyColor,ready);
     w.material.color.copy(whiteColor);w.material.opacity=.64+.36*Math.min(1,p/35);w.material.roughness=.18+.48*ready+.18*burnt;
     c.material.color.setHex(burnt>.05?0x542414:0xc58a36);c.material.opacity=Math.min(.98,Math.max(0,(p-52)/48));
     y.material.color.setHex(burnt>.05?0x74330a:p>=85?0xffb51f:0xffcf48);y.material.roughness=.12+.2*ready+.5*burnt;y.scale.set(1,Math.max(.3,.58-.16*ready-.18*burnt),1);
    }
    function updatePlayerProgress(player,amount){
     const progress=Math.max(0,Math.min(100,amount)),fill=$('progress'+player);
     fill.style.width=progress+'%';fill.classList.remove('burnt-fill');
     fill.style.background=progress>=86?'linear-gradient(90deg,#c9f5a5,#52bd79)':player===0?'linear-gradient(90deg,#b9e4ff,#549ee0)':'linear-gradient(90deg,#ffc1bb,#d65e68)';
     const outcome=progress>=100?'JUST RIGHT':progress>=86?'ALMOST READY':progress>0?'UNDERCOOKED · '+Math.round(progress)+'%':'UNDERCOOKED';
     $('p'+(player+1)+'Outcome').textContent=outcome;
     $('caption'+player).textContent=progress>=100?'Perfectly cooked!':`${Math.max(0,100-Math.round(progress))}% cooking left`;
     styleEggForProgress(player,progress);
    }
    function updateTurnStatus(){
     const name=playerNames[cur];
     setStatus('<b>'+escapeHTML(name)+'</b>, it’s your turn. Choose a numbered egg. Its hidden cooking effect will move your progress closer to or farther from JUST RIGHT.');
     $('p1Outcome').textContent=playerDoneness[0]>=100?'JUST RIGHT':(cur===0?'YOUR TURN':`${Math.round(playerDoneness[0])}% COOKED`);
     $('p2Outcome').textContent=playerDoneness[1]>=100?'JUST RIGHT':(cur===1?'YOUR TURN':`${Math.round(playerDoneness[1])}% COOKED`);
     renderScores();
    }
    function newGame(){
     if(turnTimer){clearTimeout(turnTimer);turnTimer=null;}turnToken++;
     if(K.on)kStop();celebration=null;roundNumber++;scores=scores||[0,0];playerDoneness=[0,0];cur=0;gameOver=false;locked=false;revealed=0;elapsed=0;heat=1;panTemp=0;flameScale=0;state='playing';
     buildCrate();resetEggLooks();
     [0,1].forEach(i=>{const fill=$('progress'+i);fill.style.width='0%';fill.classList.remove('burnt-fill');fill.style.background=i===0?'linear-gradient(90deg,#b9e4ff,#549ee0)':'linear-gradient(90deg,#ffc1bb,#d65e68)';$('caption'+i).textContent='100% cooking left';$('p'+(i+1)+'Outcome').textContent=i===0?'YOUR TURN':'WAITING'});
     $('againBtn').textContent='START NEW ROUND';$('result').classList.remove('show');
     setStatus('<b>Both eggs are cracked!</b> The burners are on <b>LOW</b> and both eggs are frying automatically. '+escapeHTML(playerNames[0])+', choose the first numbered egg.');
     renderScores();renderCrateButtons();
    }
    function startRoundEndAnimations(winner){
     const loser=1-winner;
     celebration={winner,loser,loserStart:playerDoneness[loser],loserElapsed:0,loserDuration:4.1,smokeAcc:0,loserDone:false,serveDone:false};
     $('p'+(winner+1)+'Outcome').textContent='JUST RIGHT!';$('caption'+winner).textContent='Perfect egg — ready to serve';
     $('p'+(loser+1)+'Outcome').textContent='OVERCOOKING…';$('caption'+loser).textContent='The heat keeps rising…';
     startWinnerServeAnimation();
    }
    function showWinner(player){
     if(turnTimer){clearTimeout(turnTimer);turnTimer=null;}turnToken++;
     gameOver=true;state='celebrating';locked=true;scores[player]++;renderScores();renderCrateButtons();
     setStatus('<b>'+escapeHTML(playerNames[player])+' has reached JUST RIGHT!</b> Serving the winner’s egg while the other pan overcooks…');
     startRoundEndAnimations(player);
     blip(660,.15);setTimeout(()=>blip(880,.25),130);setTimeout(()=>blip(1320,.35),270);
    }
    function updateLoserOvercook(dt){
     if(!celebration||celebration.loserDone)return;
     const c=celebration;c.loserElapsed+=dt;const p=Math.min(1,c.loserElapsed/c.loserDuration),ease=1-Math.pow(1-p,2);
     const amount=c.loserStart+(135-c.loserStart)*ease;styleEggForProgress(c.loser,amount);
     const fill=$('progress'+c.loser);fill.style.width='100%';fill.classList.add('burnt-fill');
     $('p'+(c.loser+1)+'Outcome').textContent='OVERCOOKING…';$('caption'+c.loser).textContent=p>.72?'Burning! Smoke is rising':'The egg is getting too hot';
     const g=c.loser===0?eggGroup:player2EggGroup;g.rotation.z=Math.sin(time*25)*.025*p;g.scale.set(1+.025*Math.sin(time*18)*p,1,1+.025*Math.sin(time*18)*p);
     c.smokeAcc+=dt*(5+20*p);while(c.smokeAcc>=1){c.smokeAcc--;const x=c.loser===0?PLAYER1_X:-PLAYER1_X,a=Math.random()*Math.PI*2,r=.2+Math.random()*.55;smoke.spawn(x+Math.cos(a)*r,.55,Math.sin(a)*r,(Math.random()-.5)*.12,.35+Math.random()*.35,(Math.random()-.5)*.12,.22+Math.random()*.18,1.1+Math.random(),.13,.12,.11)}
     if(p>=1){c.loserDone=true;$('p'+(c.loser+1)+'Outcome').textContent='OVERCOOKED';$('caption'+c.loser).textContent='Burnt egg — better luck next round';g.rotation.z=0;g.scale.set(1,1,1);maybeFinishRound()}
    }
    function maybeFinishRound(){
     if(!celebration||!celebration.loserDone||!celebration.serveDone)return;
     const {winner,loser}=celebration;celebration=null;state='over';
     ui.emoji.textContent='🏆';ui.verdict.textContent=playerNames[winner].toUpperCase()+' WINS!';ui.verdict.style.color=winner===0?'#8dcaff':'#ff9a9e';
     ui.desc.textContent=playerNames[winner]+' cooked an egg JUST RIGHT! '+playerNames[loser]+'’s egg overcooked and burned. Ready for another round?';
     ui.time.textContent='ROUND '+roundNumber+' COMPLETE · '+playerNames[winner]+' WINS: '+scores[winner];$('againBtn').textContent='START NEW ROUND';ui.result.classList.add('show');
    }
    function pickEgg(i){
     const m=crateEggs[i],u=m&&m.userData;
     if(!u||u.a>=0||locked||gameOver||state!=='playing')return;

     // Lock the crate while this pick updates the current player's meter.
     // The other player cannot pick until the meter animation has finished.
     locked=true;
     u.a=0;
     revealed++;
     blip(520,.06,'square',.05);
     popEmoji(u.d.icon,m.position);

     const player=cur;
     const delta=u.d.delta;
     const previous=playerDoneness[player];
     const next=Math.max(0,Math.min(100,previous+delta));
     playerDoneness[player]=next;
     updatePlayerProgress(player,next);
     eggFlips[player]={elapsed:0,duration:.55};
     renderCrateButtons();

     const actualDelta=next-previous;
     const effect=actualDelta>0
      ? `<b>+${actualDelta}% COOKING!</b> ${escapeHTML(playerNames[player])} moved closer to JUST RIGHT.`
      : actualDelta<0
       ? `<b>${actualDelta}% COOLING!</b> ${escapeHTML(playerNames[player])} moved farther from JUST RIGHT.`
       : `<b>COOLING SETBACK!</b> The meter stays at 0%.`;

     if(next>=100){
      setStatus('<b>'+escapeHTML(playerNames[player])+' reached 100% — JUST RIGHT!</b> The perfectly cooked egg wins the round!');
      // Let the winning meter finish filling before the celebration starts.
      const winToken=turnToken;
      turnTimer=setTimeout(()=>{turnTimer=null;if(winToken!==turnToken||gameOver)return;showWinner(player)},600);
      return;
     }

     const nextPlayer=1-player;
     setStatus('<b>'+escapeHTML(playerNames[player])+' picked egg '+(i+1)+'.</b> '+effect+
      ' Cooking progress: <b>'+Math.round(next)+'%</b>. <b>'+escapeHTML(playerNames[nextPlayer])+
      '</b> will pick next.');

     // Give the current meter time to visibly move before handing over the turn.
     const thisTurn=turnToken;
     turnTimer=setTimeout(()=>{
      turnTimer=null;
      if(thisTurn!==turnToken||gameOver||state!=='playing')return;
      cur=nextPlayer;
      if(revealed>=TOTAL){
       // Every egg is used and nobody is at 100% yet: restock the crate so turns keep alternating.
       buildCrate();
       locked=false;
       updateTurnStatus();
       setStatus('<b>Crate restocked!</b> '+escapeHTML(playerNames[cur])+', choose a numbered egg.');
       renderCrateButtons();
       return;
      }
      locked=false;
      updateTurnStatus();
      renderCrateButtons();
     },700);
    }
    const HEAT_T=[0,.35,.65,1],HEAT_NAMES=['OFF','LOW','MED','HIGH'],HEAT_FLAME=[0,.34,.55,.76];
    const BAR_MAX=140,PMIN=68,PMAX=95;
    let heat=1,doneness=0,state='menu',elapsed=0,flameScale=0,time=0,panTemp=0,cur=0,scores=[0,0],gameOver=false,locked=false,roundNumber=0,celebration=null,turnTimer=null,turnToken=0;
    let playerNames=['Player 1','Player 2'],playerDoneness=[0,0];
    function notifyHud(){onHudUpdate?.({screen:state,round:roundNumber,scores:[...scores],playerNames:[...playerNames],muted})}
    const $=id=>root.querySelector('#'+id);
    const escapeHTML=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
    function setMuted(v){muted=!!v;try{localStorage.setItem('fte-muted',muted?'1':'0')}catch(e){}
      if(masterOut&&actx)masterOut.gain.setTargetAtTime(muted?0:1,actx.currentTime,.015);notifyHud()}
    try{muted=localStorage.getItem('fte-muted')==='1'}catch(e){}
    const ui={result:$('result'),emoji:$('resultEmoji'),verdict:$('resultVerdict'),desc:$('resultDesc'),time:$('resultTime')};

    const WHITE=[[0,0xdfe6cf],[.3,0xfdfdfb],[.65,0xfffdf5],[.85,0xf8e6b8],[1.05,0xd9a95e],[1.25,0x8a5423],[1.5,0x2a1508]];
    const YOLK=[[0,0xffc93c],[.45,0xffb420],[.8,0xf9a010],[1,0xd97a08],[1.25,0x7a3d05],[1.5,0x2a1204]];
    const _b=new THREE.Color();
    function grad(stops,t,out){if(t<=stops[0][0])return out.setHex(stops[0][1]);
      for(let i=1;i<stops.length;i++)if(t<=stops[i][0]){const[t0,c0]=stops[i-1],[t1,c1]=stops[i];return out.setHex(c0).lerp(_b.setHex(c1),(t-t0)/(t1-t0))}
      return out.setHex(stops[stops.length-1][1])}

    const ray=new THREE.Raycaster(),ndc=new THREE.Vector2();
    function beginGame(){
     scores=[0,0];roundNumber=0;
     playerNames=[($('player1Input').value||'Player 1').trim().slice(0,18)||'Player 1',($('player2Input').value||'Player 2').trim().slice(0,18)||'Player 2'];
     $('panelName0').textContent=playerNames[0].toUpperCase()+' · BLUE PAN';$('panelName1').textContent=playerNames[1].toUpperCase()+' · RED PAN';
     $('setupScreen').classList.remove('active');$('splashScreen').classList.remove('active');
     $('app').style.display='block';$('ui').style.display='block';
     resizeRenderer();initAudio();newGame();
    }
    on(window,'fry-the-egg:toggle-sound',()=>{initAudio();setMuted(!muted)});
    on(window,'keydown',e=>{if(e.key!=='m'&&e.key!=='M')return;const t=e.target;if(t&&(t.tagName==='INPUT'||t.tagName==='TEXTAREA'))return;setMuted(!muted)});
    setMuted(muted);
    on($('toSetupBtn'),'click',()=>{$('setupScreen').classList.add('active');$('splashScreen').classList.remove('active')});
    on($('backToSplashBtn'),'click',()=>{$('setupScreen').classList.remove('active');$('splashScreen').classList.add('active')});
    on($('startGameBtn'),'click',beginGame);
    $('againBtn').onclick=()=>{initAudio();newGame()};
    const returnToTitle=()=>{$('result').classList.remove('show');$('ui').style.display='none';$('app').style.display='none';$('setupScreen').classList.remove('active');$('splashScreen').classList.add('active');state='menu';notifyHud()};
    $('homeBtn').onclick=returnToTitle;
    on(window,'fry-the-egg:main-menu',returnToTitle);
    on(renderer.domElement,'pointerdown',e=>{if(state!=='playing')return;initAudio();const rect=renderer.domElement.getBoundingClientRect();if(!rect.width||!rect.height)return;ndc.set((e.clientX-rect.left)/rect.width*2-1,-((e.clientY-rect.top)/rect.height)*2+1);ray.setFromCamera(ndc,camera);const ce=ray.intersectObjects(crateEggs,false);if(ce.length)pickEgg(ce[0].object.userData.i)});

    function updateEgg(dt){
     if(celebration)return;
     [eggGroup,player2EggGroup].forEach((group,player)=>{
      const flip=eggFlips[player];
      if(flip){
       flip.elapsed+=dt;const progress=Math.min(1,flip.elapsed/flip.duration);
       group.position.y=EGG_Y+Math.sin(progress*Math.PI)*.82;
       group.rotation.set(progress*Math.PI*2,0,Math.sin(progress*Math.PI)*.22);
       if(progress>=1){group.position.y=EGG_Y;group.rotation.set(0,0,0);eggFlips[player]=null}
      }else{
       group.position.y=EGG_Y;
       group.rotation.set(0,0,Math.sin(time*1.4+player)*.003);
      }
     });
    }
    function updateFlame(dt){
     flameScale+=( ((state==='playing'||state==='celebrating')?HEAT_FLAME[1]:0)-flameScale)*Math.min(1,dt*9);
     const vis=flameScale>.012;flameGroup.visible=vis;flameGroup2.visible=vis;
     if(vis){
      for(let i=0;i<jets.length;i++){
       const f=1+Math.sin(time*17+jets[i].phase)*.13+Math.sin(time*29+jets[i].phase*2.3)*.07;
       const sc=1+flameScale*.12;const h=flameScale*f;
       jets[i].mesh.scale.set(sc,h,sc);jets2[i].scale.set(sc,h,sc);jets[i].mesh.material.opacity=.82*Math.min(1,flameScale*2.2);
      }
      const cf=1+Math.sin(time*24)*.09,sc=1+flameScale*.3;
      flameCore.scale.set(sc,flameScale*.85*cf,sc);flameCore2.scale.copy(flameCore.scale);
      flameCore.material.opacity=.5*Math.min(1,flameScale*2);glowMat.opacity=.28*Math.min(1,flameScale*2.5);flameGlow.scale.setScalar(.7+flameScale*.6);flameGlow2.scale.copy(flameGlow.scale);
     }else{glowMat.opacity=0}
     const intensity=flameScale*5.5*(.82+Math.sin(time*23.1)*.09+Math.sin(time*37.7)*.06);
     flameLight.intensity=intensity;flameLight2.intensity=intensity;flameLight.position.y=.45+flameScale*.35;flameLight2.position.y=flameLight.position.y;
     if(sizzleGain){const tg=(state==='playing'||state==='celebrating')?.035*(.85+Math.random()*.3):0;sizzleGain.gain.value+=(tg-sizzleGain.gain.value)*Math.min(1,dt*6)}
    }
    function updateParticles(dt){
     if(state==='playing'&&panTemp>.2){
      sAcc+=dt*panTemp*15;while(sAcc>=1){sAcc--;for(const x of [PLAYER1_X,-PLAYER1_X]){const a=Math.random()*6.28,r=.3+Math.random()*.55;sparks.spawn(x+Math.cos(a)*r,.46,Math.sin(a)*r,(Math.random()-.5)*.4,.35+Math.random()*.5,(Math.random()-.5)*.4,.035+Math.random()*.04,.3+Math.random()*.25,1,.8,.42)}}
     }
     sparks.update(dt);smoke.update(dt);
    }
    let sAcc=0,lastLb='';

    const KZ=-7.3,KPX=-.35,RAW_R=.28,PLATE_X=2.65;
    const kEase=t=>t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2,kClamp=x=>Math.max(0,Math.min(1,x));
    const kitchen=new THREE.Group();kitchen.position.set(0,0,KZ);scene.add(kitchen);kitchen.visible=false;
    const kLight=new THREE.PointLight(0xff8a3a,0,7,2);kLight.position.set(KPX,.8,KZ);scene.add(kLight);kLight.visible=false;
    kitchen.add(mesh(new THREE.BoxGeometry(3.4,.18,3.1),M(0x1b1e24,.45,.7),[KPX,.09,0]));
    const kBurnerMat=M(0x3a3d44,.55,.85),kGrateMat=M(0x15171b,.5,.9);
    kitchen.add(mesh(new THREE.CylinderGeometry(.6,.7,.06,40),kBurnerMat,[KPX,.21,0]));
    kitchen.add(mesh(new THREE.CylinderGeometry(.3,.34,.05,32),kBurnerMat,[KPX,.255,0]));
    for(let i=0;i<4;i++){const a=Math.PI/4+i*Math.PI/2;const arm=mesh(new THREE.BoxGeometry(.92,.06,.13),kGrateMat,[KPX+Math.cos(a)*.7,.3,Math.sin(a)*.7]);arm.rotation.y=-a;kitchen.add(arm)}
    const kRing=mesh(new THREE.TorusGeometry(1.16,.032,8,56),kGrateMat,[KPX,.3,0]);kRing.rotation.x=Math.PI/2;kitchen.add(kRing);
    kitchen.add(mesh(new THREE.BoxGeometry(2.6,.1,2.2),M(0x8a919c,.35,.85),[PLATE_X,.05,.2]));
    const kPanMat=panMat.clone();
    const kPivot=new THREE.Group();kPivot.position.set(KPX,.33,0);kitchen.add(kPivot);
    const kBody=new THREE.Group();kBody.rotation.y=1.1;kPivot.add(kBody);
    kBody.add(mesh(new THREE.CylinderGeometry(1.2,.95,.42,56,1,true),kPanMat,[0,.21,0]));
    kBody.add(mesh(new THREE.CylinderGeometry(.955,.955,.08,56),kPanMat,[0,.04,0]));
    const kRim=mesh(new THREE.TorusGeometry(1.2,.035,8,64),kPanMat,[0,.42,0]);kRim.rotation.x=Math.PI/2;kBody.add(kRim);
    const kHandle=mesh(new THREE.CylinderGeometry(.055,.075,1.05,14),M(0x15171a,.65,.5),[1.7,.36,0]);kHandle.rotation.z=-Math.PI/2;kBody.add(kHandle);
    kBody.add(mesh(new THREE.BoxGeometry(.22,.1,.16),kPanMat,[1.22,.38,0]));
    const kEgg=new THREE.Group();kEgg.position.y=EGG_Y;kEgg.visible=false;kPivot.add(kEgg);
    const kWhiteMat=whiteMat.clone(),kCrispMat=crispMat.clone(),kYolkMat=yolkMat.clone();
    kEgg.add(mesh(wg,kWhiteMat));
    const kCrisp=new THREE.Mesh(wg,kCrispMat);kCrisp.scale.set(1.06,.7,1.06);kCrisp.position.y=-.012;kCrisp.receiveShadow=true;kEgg.add(kCrisp);
    const kYolk=mesh(new THREE.SphereGeometry(.26,32,24),kYolkMat,[.05,.02,.03]);kYolk.scale.set(1,.5,1);kEgg.add(kYolk);
    const kOil=new THREE.Mesh(new THREE.CircleGeometry(.93,48),new THREE.MeshPhysicalMaterial({color:0xe8b64a,roughness:.05,transparent:true,opacity:.35,clearcoat:1}));kOil.rotation.x=-Math.PI/2;kOil.position.y=.082;kPivot.add(kOil);
    const kFlame=new THREE.Group();kFlame.position.set(KPX,.245,0);kFlame.visible=false;kitchen.add(kFlame);
    const kJets=[];
    for(let i=0;i<12;i++){const a=i/12*Math.PI*2;const g=new THREE.ConeGeometry(.072,1,8,1,true);g.translate(0,.5,0);
      const m=new THREE.MeshBasicMaterial({color:0x5aa8ff,transparent:true,opacity:.85,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide});
      const j=new THREE.Mesh(g,m);j.position.set(Math.cos(a)*.62,0,Math.sin(a)*.62);j.rotation.x=Math.sin(a)*.6;j.rotation.z=-Math.cos(a)*.6;kFlame.add(j);kJets.push({mesh:j,phase:Math.random()*12})}
    const kcg=new THREE.ConeGeometry(.26,1,16,1,true);kcg.translate(0,.5,0);
    const kCoreMat=new THREE.MeshBasicMaterial({color:0xcfe6ff,transparent:true,opacity:.55,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide});
    const kCore=new THREE.Mesh(kcg,kCoreMat);kFlame.add(kCore);
    const kGlowMat=new THREE.MeshBasicMaterial({color:0xff7a20,transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false});
    const kGlow=new THREE.Mesh(new THREE.CircleGeometry(1.15,40),kGlowMat);kGlow.rotation.x=-Math.PI/2;kGlow.position.set(KPX,.22,0);kitchen.add(kGlow);
    const kBowl=new THREE.Group();kBowl.position.set(-2.95,0,.05);kitchen.add(kBowl);
    const kCeramic=M(0xd9d3c5,.35,0,{side:THREE.DoubleSide});
    kBowl.add(mesh(new THREE.LatheGeometry([[0,0],[.3,0],[.46,.08],[.56,.2],[.6,.36]].map(p=>new THREE.Vector2(p[0],p[1])),28),kCeramic,[0,0,0]));
    const kBowlRim=mesh(new THREE.TorusGeometry(.6,.025,8,28),kCeramic,[0,.36,0]);kBowlRim.rotation.x=Math.PI/2;kBowl.add(kBowlRim);
    const kBowlEggs=[[-.14,.3,0],[.17,.28,.1],[.02,.3,-.2]].map((p,i)=>{const e=mesh(new THREE.SphereGeometry(.24,20,14),M(0xf3ead6,.45,0),p);e.scale.set(1,1.25,1);e.rotation.set(.2*i,i*2,.15);kBowl.add(e);return e});
    const kPlate=new THREE.Group();kPlate.position.set(PLATE_X,.1,.2);kPlate.visible=false;kitchen.add(kPlate);
    const kPlateMat=M(0xf2efe8,.25,0);
    kPlate.add(mesh(new THREE.CylinderGeometry(1,.78,.06,40),kPlateMat,[0,.04,0]));
    const kPlateRim=mesh(new THREE.TorusGeometry(.98,.03,8,48),kPlateMat,[0,.07,0]);kPlateRim.rotation.x=Math.PI/2;kPlate.add(kPlateRim);
    const kBell=new THREE.Group();kBell.position.set(3.05,.1,1.55);kitchen.add(kBell);
    const kBrass=M(0xd9a53a,.3,.9);
    kBell.add(mesh(new THREE.CylinderGeometry(.3,.34,.05,24),kBrass,[0,.025,0]));
    kBell.add(mesh(new THREE.SphereGeometry(.26,20,12,0,Math.PI*2,0,Math.PI/2),kBrass,[0,.05,0]));
    kBell.add(mesh(new THREE.SphereGeometry(.05,12,10),kBrass,[0,.33,0]));
    const kShellMat=M(0xf4ead2,.5,0,{side:THREE.DoubleSide});
    const kRaw=new THREE.Group();kRaw.visible=false;kitchen.add(kRaw);
    const kTop=mesh(new THREE.SphereGeometry(RAW_R,24,10,0,Math.PI*2,0,Math.PI/2),kShellMat);
    const kBot=mesh(new THREE.SphereGeometry(RAW_R,24,10,0,Math.PI*2,Math.PI/2,Math.PI/2),kShellMat);
    kRaw.add(kTop,kBot);
    const crackPts=[];for(let i=0;i<24;i++){const a=i/24*Math.PI*2,j=(i%2?.035:-.035)*(.6+Math.random()*.8);crackPts.push(new THREE.Vector3(Math.cos(a)*RAW_R*1.02,j,Math.sin(a)*RAW_R*1.02))}
    const kCrack=new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(crackPts,true),72,.011,5,true),new THREE.MeshBasicMaterial({color:0x4b2f16}));kCrack.visible=false;kRaw.add(kCrack);
    const kSparks=new Particles(140,THREE.AdditiveBlending,-3.4),kSmoke=new Particles(120,THREE.NormalBlending,.55);kSparks.points.visible=false;kSmoke.points.visible=false;
    const KPH=['fetch','tap','move','open','cook1','flip','cook2','tilt','slide','serve','away','rest'];
    const KDUR={fetch:.55,tap:.5,move:.24,open:.68,cook1:1.1,flip:.52,cook2:1.1,tilt:.38,slide:.4,serve:.72,away:.38,rest:.28};
    const KFL={fetch:.3,tap:.3,move:.3,open:.42,cook1:.56,flip:.56,cook2:.56,tilt:.42,slide:.3,serve:.28,away:.28,rest:.28};
    const KS0=new THREE.Vector3(-2.78,.3,.15),KH1=new THREE.Vector3(KPX-1.2,1.58,0),KC=new THREE.Vector3(KPX,1.58,0);
    const K={on:false,ph:'off',t:0,dn:0,up:0,served:0,landed:false,inPan:false,t1:false,t2:false,fl:0,flT:0,shards:[],sa:0,ma:0,s0:new THREE.Vector3(),e0:new THREE.Vector3(),r0:new THREE.Vector3()};
    function kRestoreShells(){kRaw.add(kTop,kBot);[kTop,kBot].forEach(m=>{m.position.set(0,0,0);m.rotation.set(0,0,0);m.scale.set(1,1.3,1);m.visible=true});kCrack.visible=false}
    function kReset(){
      kPivot.position.set(KPX,.33,0);kPivot.rotation.set(0,0,0);
      kPivot.add(kEgg);kEgg.visible=false;kEgg.position.set(0,EGG_Y,0);kEgg.rotation.set(0,0,0);kEgg.scale.set(1,1,1);
      K.shards.length=0;kRestoreShells();kRaw.visible=false;
      kPlate.visible=false;kPlate.position.set(PLATE_X,.1,.2);kPlate.scale.setScalar(1);
      kBowlEggs.forEach(e=>e.visible=true);
      K.inPan=false;K.landed=false;K.dn=0;K.up=0;kSparks.clear();kSmoke.clear()}
    function kPuff(){for(let i=0;i<8;i++)kSmoke.spawn(KH1.x+(Math.random()-.5)*.3,1.05,KZ+(Math.random()-.5)*.3,(Math.random()-.5)*.4,.25+Math.random()*.3,(Math.random()-.5)*.3,.16+Math.random()*.1,.8+Math.random()*.5,.96,.94,.86)}
    function kPop(txt,x,y,z){const cv=document.createElement('canvas'),c=cv.getContext('2d'),f='800 38px "Segoe UI",system-ui,sans-serif';
      c.font=f;cv.width=Math.ceil(c.measureText(txt).width)+64;cv.height=110;
      const x0=5,y0=5,w=cv.width-10,h=cv.height-10,r=26;
      c.fillStyle='rgba(18,21,28,.88)';c.strokeStyle='#ffd479';c.lineWidth=5;
      c.beginPath();c.moveTo(x0+r,y0);c.arcTo(x0+w,y0,x0+w,y0+h,r);c.arcTo(x0+w,y0+h,x0,y0+h,r);c.arcTo(x0,y0+h,x0,y0,r);c.arcTo(x0,y0,x0+w,y0,r);c.closePath();c.fill();c.stroke();
      c.fillStyle='#ffe6a8';c.font=f;c.textAlign='center';c.textBaseline='middle';c.fillText(txt,cv.width/2,cv.height/2+3);
      const s=new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(cv),transparent:true,depthTest:false}));
      s.scale.set(.79*cv.width/cv.height,.79,1);s.position.set(x,y,z);s.renderOrder=9;scene.add(s);pops.push({s,t:0})}
    function kCrackOpen(){
      kitchen.attach(kTop);kitchen.attach(kBot);kCrack.visible=false;kRaw.visible=false;
      K.shards.push({m:kTop,v:new THREE.Vector3(-1.9,1.5,-.8),w:new THREE.Vector3(4,3,-6),age:0,rest:0},{m:kBot,v:new THREE.Vector3(-1.1,.6,1.2),w:new THREE.Vector3(-5,2,4),age:0,rest:0});
      blip(300,.1,'sawtooth',.05,120);
      for(let i=0;i<6;i++)kSmoke.spawn(KPX+(Math.random()-.5)*.4,1.5,KZ+(Math.random()-.5)*.4,(Math.random()-.5)*.5,.2+Math.random()*.3,(Math.random()-.5)*.4,.15+Math.random()*.1,.7+Math.random()*.4,.96,.94,.86)}
    const kEnter={
      fetch(){kRestoreShells();kBowlEggs[1].visible=false;kRaw.visible=true;kRaw.position.copy(KS0);kRaw.rotation.set(0,0,0);K.t1=false;K.t2=false;K.landed=false;K.dn=0;K.up=0;blip(700,.07,'sine',.04,1000)},
      open(){kCrackOpen()},
      flip(){blip(380,.24,'sine',.05,900);for(let i=0;i<10;i++){const a=Math.random()*6.28,r=Math.random()*.7;kSparks.spawn(KPX+Math.cos(a)*r,.55+Math.random()*.2,KZ+Math.sin(a)*r,Math.cos(a)*.8,.9+Math.random(),Math.sin(a)*.8,.06+Math.random()*.05,.5+Math.random()*.4,1,.75,.3)}},
      cook2(){kPlate.visible=true;kPlate.scale.setScalar(.001);kPlate.position.set(PLATE_X,.1,.2)},
      tilt(){blip(260,.18,'triangle',.04,420)},
      slide(){K.inPan=false;kitchen.attach(kEgg);K.s0.copy(kEgg.position);K.r0.set(kEgg.rotation.x,kEgg.rotation.y,kEgg.rotation.z);K.e0.set(kPlate.position.x,kPlate.position.y+.12,kPlate.position.z)},
      serve(){K.served++;blip(1760,.9,'sine',.06);blip(2637,.7,'sine',.035);setTimeout(()=>{blip(1760,.8,'sine',.05);blip(2637,.6,'sine',.03)},190);
        kPop('🏆 PERFECT EGG SERVED!',1.1,1.65,KZ+.2);
        for(let i=0;i<8;i++)kSmoke.spawn(PLATE_X+(Math.random()-.5)*.8,.45,KZ+.2+(Math.random()-.5)*.8,(Math.random()-.5)*.15,.35+Math.random()*.25,(Math.random()-.5)*.15,.2+Math.random()*.15,1.2+Math.random(),.7,.72,.75)},
      rest(){kBowlEggs[1].visible=true;K.dn=0;K.up=0}
    };
    const kExit={
      flip(){const x=K.dn;K.dn=K.up;K.up=x;kEgg.position.y=EGG_Y;kEgg.rotation.set(0,0,0);kPivot.position.set(KPX,.33,0);kPivot.rotation.z=0;blip(300,.1,'triangle',.05,120)},
      slide(){kPlate.attach(kEgg);kEgg.position.set(0,.12,0);kEgg.rotation.set(0,0,0);kPivot.position.set(KPX,.33,0);kPivot.rotation.z=0},
      away(){kPlate.visible=false;kPlate.position.set(PLATE_X,.1,.2);kPlate.scale.setScalar(1);kPivot.add(kEgg);kEgg.visible=false;kEgg.position.set(0,EGG_Y,0);kEgg.rotation.set(0,0,0);kEgg.scale.set(1,1,1)}
    };
    function kGo(ph){K.ph=ph;K.t=0;K.flT=KFL[ph];if(kEnter[ph])kEnter[ph]()}
    function kStart(){kReset();K.served=0;K.on=true;kGo('fetch')}
    function kStop(){K.on=false;K.ph='off';K.flT=0;kReset();kitchen.visible=false;kLight.visible=false;kSparks.points.visible=false;kSmoke.points.visible=false}
    function startWinnerServeAnimation(){kitchen.visible=true;kLight.visible=true;kSparks.points.visible=true;kSmoke.points.visible=true;kStart()}
    function kRun(dt){const p=kClamp(K.t/KDUR[K.ph]);
      switch(K.ph){
      case 'fetch':{const e=kEase(p);kRaw.position.lerpVectors(KS0,KH1,e);kRaw.position.y+=Math.sin(p*Math.PI)*.5;kRaw.rotation.set(0,p*Math.PI*2,Math.sin(p*Math.PI)*.5);break}
      case 'tap':{const t=K.t,pu=c=>Math.max(0,1-Math.abs(t-c)/.14),dip=pu(.32)+pu(.78);
        kRaw.position.set(KH1.x,KH1.y-.42*dip,0);kRaw.rotation.set(0,0,.1+dip*.12);
        if(!K.t1&&t>=.32){K.t1=true;blip(1100,.05,'square',.04,700)}
        if(!K.t2&&t>=.78){K.t2=true;kCrack.visible=true;blip(900,.07,'square',.05,420);kPuff()}
        break}
      case 'move':{const e=kEase(p);kRaw.position.lerpVectors(KH1,KC,e);kRaw.rotation.set(0,0,.1+.3*e);break}
      case 'open':{
        if(K.t>=.08){kEgg.visible=true;const k=kClamp((K.t-.08)/.7),f=k<.5?k/.5:1;
          kEgg.position.y=EGG_Y+(1-f)*(1-f)*1.05;const s=k<.5?.35:.35+.65*(1-Math.pow(1-(k-.5)/.5,3));kEgg.scale.set(s,k<.5?1.3:1.3-.3*(k-.5)*2,s);
          if(k>=1&&!K.landed){K.landed=true;K.inPan=true;blip(300,.12,'triangle',.05,120);
            for(let i=0;i<14;i++){const a=Math.random()*6.28,r=.3+Math.random()*.5;kSparks.spawn(KPX+Math.cos(a)*r,.5,KZ+Math.sin(a)*r,Math.cos(a)*.7,.8+Math.random(),Math.sin(a)*.7,.06+Math.random()*.05,.5+Math.random()*.4,1,.75,.3)}}}
        break}
      case 'cook1':K.dn+=38*dt;K.up+=32*dt;break;
      case 'cook2':K.dn+=38*dt;K.up+=32*dt;kPlate.scale.setScalar(Math.max(.001,kEase(kClamp(K.t/.45))));break;
      case 'flip':{kEgg.position.y=EGG_Y+Math.sin(p*Math.PI)*.85;kEgg.rotation.x=p*Math.PI*2;kEgg.rotation.z=Math.sin(p*Math.PI)*.28;
        kPivot.position.y=.33+Math.sin(kClamp(p*1.6)*Math.PI)*.1;kPivot.rotation.z=Math.sin(kClamp(p*2)*Math.PI)*.1;break}
      case 'tilt':{const e=kEase(p);kPivot.position.set(KPX+.8*e,.33+.62*e,0);kPivot.rotation.z=-.65*e;kEgg.position.x=.65*e;break}
      case 'slide':{const e=kEase(p),b=1-e;kEgg.position.lerpVectors(K.s0,K.e0,e);kEgg.position.y+=Math.sin(p*Math.PI)*.4;
        kEgg.rotation.set(K.r0.x*b,K.r0.y*b,K.r0.z*b);kPivot.position.set(KPX+.8*b,.33+.62*b,0);kPivot.rotation.z=-.65*b;break}
      case 'serve':{kPlate.position.y=.1+Math.sin(p*Math.PI)*.07;const bp=kClamp(K.t/.5);kBell.scale.set(1+Math.sin(bp*Math.PI)*.12,1-Math.sin(bp*Math.PI)*.1,1+Math.sin(bp*Math.PI)*.12);kBell.rotation.z=Math.sin(bp*Math.PI*4)*.12*(1-bp);break}
      case 'away':{const e=p*p;kPlate.position.x=PLATE_X+3*e;kPlate.position.y=.1+Math.sin(p*Math.PI)*.2;kPlate.scale.setScalar(Math.max(.001,1-kClamp((p-.4)/.6)));break}
      }}
    function kUpdateEgg(){const t=K.up/100;kCrispMat.opacity=Math.min(.95,Math.max(0,(K.dn-55)/50));kYolkMat.clearcoat=1-Math.min(1,t)*.7;
      grad(WHITE,t,kWhiteMat.color);kWhiteMat.opacity=THREE.MathUtils.lerp(.6,1,Math.min(1,t/.4));kWhiteMat.roughness=THREE.MathUtils.lerp(.14,.78,Math.min(1,t));
      grad(YOLK,t,kYolkMat.color);kYolkMat.roughness=THREE.MathUtils.lerp(.16,.7,Math.min(1,t));
      let p=.5+Math.min(t,1)*.11;if(t>1.1)p-=(t-1.1)*.08;kYolk.scale.set(1,Math.max(.35,p),1)}
    function kShards(dt){
      for(let i=K.shards.length-1;i>=0;i--){const s=K.shards[i],m=s.m;
        if(!s.rest){s.v.y-=9.5*dt;m.position.addScaledVector(s.v,dt);m.rotation.x+=s.w.x*dt;m.rotation.y+=s.w.y*dt;m.rotation.z+=s.w.z*dt;
          const fl=(m.position.x>-2.05&&m.position.x<1.35&&Math.abs(m.position.z)<1.55)?.2:.07;
          if(m.position.y<fl){m.position.y=fl;if(s.v.y<-1.2){s.v.y*=-.28;s.v.x*=.6;s.v.z*=.6;s.w.multiplyScalar(.5)}else{s.rest=1;s.v.set(0,0,0)}}}
        s.age+=dt;if(s.age>3.4){const k=kClamp((s.age-3.4)/.4);m.scale.set(Math.max(.001,1-k),Math.max(.001,1.3*(1-k)),Math.max(.001,1-k));if(k>=1){m.visible=false;K.shards.splice(i,1)}}}}
    function kFlame_(dt){
      K.fl+=(K.flT-K.fl)*Math.min(1,dt*7);const f=K.fl,vis=f>.012;kFlame.visible=vis;
      if(vis){for(const j of kJets){const w=1+Math.sin(time*17+j.phase)*.13+Math.sin(time*29+j.phase*2.3)*.07;j.mesh.scale.set(1+f*.12,f*w*.5,1+f*.12);j.mesh.material.opacity=.7*Math.min(1,f*2.2)}
        const cf=1+Math.sin(time*24)*.09;kCore.scale.set(1+f*.3,f*.45*cf,1+f*.3);kCoreMat.opacity=.5*Math.min(1,f*2);kGlowMat.opacity=.28*Math.min(1,f*2.5);kGlow.scale.setScalar(.7+f*.6)}
      else kGlowMat.opacity=0;
      kLight.intensity=f*4*(.85+Math.sin(time*23.1)*.1);kLight.position.y=.6+f*.35;
      const tt=Math.min(1,f/.56)*.7;kPanMat.emissive.setRGB(.16*tt*tt,.03*tt*tt,0)}
    function kFx(dt){
      const frying=K.on&&K.inPan&&K.ph!=='tilt'&&K.ph!=='slide';
      if(frying){K.sa+=dt*(8+Math.max(0,1-(K.dn+K.up)/140)*30);
        while(K.sa>=1){K.sa--;const a=Math.random()*6.28,r=.22+Math.random()*.62;kSparks.spawn(KPX+Math.cos(a)*r,.44+Math.random()*.06,KZ+Math.sin(a)*r,(Math.random()-.5)*.55,.65+Math.random()*1.1,(Math.random()-.5)*.55,.045+Math.random()*.05,.35+Math.random()*.5,1,.72+Math.random()*.25,.28)}
        if(K.up<70){K.ma+=dt*7;while(K.ma>=1){K.ma--;const a=Math.random()*6.28,r=Math.random()*.7;kSmoke.spawn(KPX+Math.cos(a)*r,.5,KZ+Math.sin(a)*r,(Math.random()-.5)*.1,.3+Math.random()*.25,(Math.random()-.5)*.1,.2+Math.random()*.15,1.2+Math.random(),.6,.62,.65)}}}
      kSparks.update(dt);kSmoke.update(dt);
      if(bgSizzle){const tg=frying?.022*(1.1-Math.min(1,(K.dn+K.up)/240)*.5)*(.85+Math.random()*.3):0;bgSizzle.gain.value+=(tg-bgSizzle.gain.value)*Math.min(1,dt*6)}}
    function kUpdate(dt){
      if(K.on){K.t+=dt;kRun(dt);if(K.t>=KDUR[K.ph]){const finishedPhase=K.ph,x=kExit[finishedPhase];if(x)x();if(finishedPhase==='rest'&&K.served>0){kStop();if(celebration){celebration.serveDone=true;maybeFinishRound()}}else{kGo(KPH[(KPH.indexOf(finishedPhase)+1)%KPH.length])}}if(K.on)kUpdateEgg()}
      kShards(dt);kFlame_(dt);kFx(dt)}
    let last=performance.now(),mx=0,my=0,cx=0,cy=0;
    on(window,'pointermove',e=>{const rect=renderer.domElement.getBoundingClientRect();if(!rect.width||!rect.height)return;mx=(e.clientX-rect.left)/rect.width*2-1;my=(e.clientY-rect.top)/rect.height*2-1;ndc.set(mx,-my);ray.setFromCamera(ndc,camera);const h=ray.intersectObjects(crateEggs,false);hoverI=h.length?h[0].object.userData.i:-1});
    function animate(now){if(disposed)return;raf=requestAnimationFrame(animate);
     const dt=Math.min((now-last)/1000,.05);last=now;time+=dt;
     if(state==='playing'){elapsed+=dt;panTemp+=(HEAT_T[1]-panTemp)*Math.min(1,dt*.45)}
     for(const m of crateEggs){const u=m.userData;if(u.a>=0){u.a+=dt;const k=Math.min(1,u.a/.5);m.position.y=.36+k*.9;m.scale.set(1-k,1.3*(1-k),1-k);m.rotation.y+=dt*10;if(k>=1)m.visible=false;if(u.badge)u.badge.visible=false}else{const h=u.i===hoverI&&!locked&&!gameOver?.1:0;m.position.y+=(.36+h-m.position.y)*Math.min(1,dt*12);if(u.badge){u.badge.position.y=m.position.y+.29;u.badge.visible=true}}}
     for(let i=pops.length-1;i>=0;i--){const p=pops[i];p.t+=dt;p.s.position.y+=dt*.5;p.s.material.opacity=Math.max(0,1-p.t/1.6);if(p.t>1.6){scene.remove(p.s);pops.splice(i,1)}}
     updateEgg(dt);if(celebration)updateLoserOvercook(dt);updateFlame(dt);updateParticles(dt);knobMesh.rotation.y+=(-.65+.72-knobMesh.rotation.y)*Math.min(1,dt*10);knobMesh2.rotation.y+=(-.65+.72-knobMesh2.rotation.y)*Math.min(1,dt*10);panMat.emissive.setRGB(.16*panTemp*panTemp,.03*panTemp*panTemp,0);
     cx+=(mx*.32-cx)*Math.min(1,dt*3);cy+=(my*.22-cy)*Math.min(1,dt*3);
     camera.position.set(CAM_BASE.x+cx,CAM_BASE.y-cy*.5+Math.sin(time*.6)*.02,CAM_BASE.z);camera.lookAt(CAM_LOOK);
     kUpdate(dt);renderer.render(scene,camera)}
    on(window,'resize',resizeRenderer);
    if(typeof ResizeObserver!=='undefined'){const resizeObserver=new ResizeObserver(resizeRenderer);resizeObserver.observe(root);offs.push(()=>resizeObserver.disconnect())}
    raf=requestAnimationFrame(animate);


    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      offs.forEach(f => f());
      if (turnTimer) clearTimeout(turnTimer);
      turnToken++;
      try { if (actx && actx.state !== 'closed') actx.close(); } catch (e) {}
      actx = null;
      try {
        renderer.dispose();
        if (renderer.forceContextLoss) renderer.forceContextLoss();
        if (renderer.domElement.parentNode) renderer.domElement.parentNode.removeChild(renderer.domElement);
      } catch (e) {}
    };
  }, [onHudUpdate]);

  return (
    <div className="fte-root" ref={rootRef}>
      <style>{CSS}</style>
      <div id="splashScreen" className="pre-screen active">
        <div className="pre-card splash-card">
          <div className="hero-egg">🍳</div>
          <div className="eyebrow">A TWO-PLAYER COOK-OFF</div>
          <h1>READY TO COOK?</h1>
          <p className="pre-subtitle">One crate. Two pans. One perfectly cooked egg.</p>
          <div className="how-to-grid">
            <div><span>01</span><b>CRACK & COOK</b><small>Both eggs start frying on low heat.</small></div>
            <div><span>02</span><b>PICK A NUMBER</b><small>Choose a numbered egg from the crate.</small></div>
            <div><span>03</span><b>GET IT JUST RIGHT</b><small>Be the first to fill your cooking bar to 100%.</small></div>
          </div>
          <button id="toSetupBtn" className="big-button">LET’S PLAY <span>→</span></button>
          <div className="pre-foot">NO TIMING BUTTONS · CHOOSE YOUR WAY TO THE PERFECT EGG</div>
        </div>
      </div>

      <div id="setupScreen" className="pre-screen">
        <div className="pre-card setup-card">
          <div className="eyebrow">BEFORE THE PANS GET HOT</div>
          <h2>WHO’S COOKING?</h2>
          <p className="pre-subtitle">Add the two player names to set up your cook-off.</p>
          <div className="player-input-row blue-input">
            <div className="input-icon">🔵</div>
            <label htmlFor="player1Input">PLAYER 1 <span>BLUE PAN</span></label>
            <input id="player1Input" maxLength="18" autoComplete="off" placeholder="Enter player 1 name" defaultValue="Player 1" />
          </div>
          <div className="player-input-row red-input">
            <div className="input-icon">🔴</div>
            <label htmlFor="player2Input">PLAYER 2 <span>RED PAN</span></label>
            <input id="player2Input" maxLength="18" autoComplete="off" placeholder="Enter player 2 name" defaultValue="Player 2" />
          </div>
          <div className="setup-note">Take turns choosing numbered eggs. Good picks cook your egg closer to 100%; cooling picks set your progress back.</div>
          <button id="startGameBtn" className="big-button">START COOKING <span>→</span></button>
          <button id="backToSplashBtn" className="text-button">← BACK</button>
        </div>
      </div>

      <div id="app"></div>
      <div id="ui">
        <div id="status">Both eggs are cracked into the pans. The burners are on <b>LOW</b> and both eggs are frying automatically.</div>
        <div id="bottomHud">
          <section id="panel" className="player-card active">
            <div className="card-top"><span className="player-blue" id="panelName0">PLAYER 1 · BLUE PAN</span><span className="outcome" id="p1Outcome">YOUR TURN</span></div>
            <div className="cook-label">COOKING PROGRESS</div>
            <div className="progress-track"><div className="perfect-zone"></div><div className="cook-fill" id="progress0"></div></div>
            <div className="progress-scale"><span>UNDERCOOKED</span><span>JUST RIGHT</span></div>
            <div className="state-caption" id="caption0">Choose eggs to cook it</div>
          </section>
          <div id="eggLegend">
            <div className="legend-title">🥚 PICK A NUMBER</div>
            <div className="legend-sub">Cook it closer · cooling sets it back</div>
            <div id="crateChoiceButtons" aria-label="Choose a numbered egg"></div>
          </div>
          <section id="p2Panel" className="player-card">
            <div className="card-top"><span className="player-red" id="panelName1">PLAYER 2 · RED PAN</span><span className="outcome" id="p2Outcome">WAITING</span></div>
            <div className="cook-label">COOKING PROGRESS</div>
            <div className="progress-track"><div className="perfect-zone"></div><div className="cook-fill red-fill" id="progress1"></div></div>
            <div className="progress-scale"><span>UNDERCOOKED</span><span>JUST RIGHT</span></div>
            <div className="state-caption" id="caption1">Choose eggs to cook it</div>
          </section>
        </div>
        <div id="result"><div id="resultCard">
          <div id="resultEmoji">🏆</div><div id="resultVerdict">PERFECT EGG!</div><div id="resultDesc"></div><div id="resultTime"></div>
          <button id="againBtn">PLAY AGAIN</button>
          <button id="homeBtn" className="result-home">BACK TO TITLE</button>
        </div></div>
      </div>
    </div>
  );
}