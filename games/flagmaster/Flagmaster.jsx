import { useState, useCallback, useEffect, useRef } from "react";

// ═══════════════════════════════════════════════
// DATA (ported verbatim from flagmaster-premium.html)
// ═══════════════════════════════════════════════
const countryData = [["AF","Afghanistan"],["AX","Åland Islands"],["AL","Albania"],["DZ","Algeria"],["AD","Andorra"],["AO","Angola"],["AI","Anguilla"],["AG","Antigua & Barbuda"],["AR","Argentina"],["AM","Armenia"],["AW","Aruba"],["AU","Australia"],["AT","Austria"],["AZ","Azerbaijan"],["BS","Bahamas"],["BH","Bahrain"],["BD","Bangladesh"],["BB","Barbados"],["BY","Belarus"],["BE","Belgium"],["BZ","Belize"],["BJ","Benin"],["BM","Bermuda"],["BT","Bhutan"],["BO","Bolivia"],["BA","Bosnia & Herzegovina"],["BW","Botswana"],["BR","Brazil"],["IO","British Indian Ocean Territory"],["VG","British Virgin Islands"],["BN","Brunei"],["BG","Bulgaria"],["BF","Burkina Faso"],["BI","Burundi"],["KH","Cambodia"],["CM","Cameroon"],["CA","Canada"],["CV","Cape Verde"],["KY","Cayman Islands"],["CF","Central African Republic"],["TD","Chad"],["CL","Chile"],["CN","China"],["CO","Colombia"],["KM","Comoros"],["CG","Congo"],["CD","Congo (DRC)"],["CK","Cook Islands"],["CR","Costa Rica"],["CI","Côte d'Ivoire"],["HR","Croatia"],["CU","Cuba"],["CW","Curaçao"],["CY","Cyprus"],["CZ","Czechia"],["DK","Denmark"],["DJ","Djibouti"],["DM","Dominica"],["DO","Dominican Republic"],["EC","Ecuador"],["EG","Egypt"],["SV","El Salvador"],["GQ","Equatorial Guinea"],["ER","Eritrea"],["EE","Estonia"],["SZ","Eswatini"],["ET","Ethiopia"],["FO","Faroe Islands"],["FJ","Fiji"],["FI","Finland"],["FR","France"],["PF","French Polynesia"],["GA","Gabon"],["GM","Gambia"],["GE","Georgia"],["DE","Germany"],["GH","Ghana"],["GR","Greece"],["GL","Greenland"],["GD","Grenada"],["GT","Guatemala"],["GN","Guinea"],["GW","Guinea-Bissau"],["GY","Guyana"],["HT","Haiti"],["HN","Honduras"],["HK","Hong Kong"],["HU","Hungary"],["IS","Iceland"],["IN","India"],["ID","Indonesia"],["IR","Iran"],["IQ","Iraq"],["IE","Ireland"],["IL","Israel"],["IT","Italy"],["JM","Jamaica"],["JP","Japan"],["JO","Jordan"],["KZ","Kazakhstan"],["KE","Kenya"],["KI","Kiribati"],["XK","Kosovo"],["KW","Kuwait"],["KG","Kyrgyzstan"],["LA","Laos"],["LV","Latvia"],["LB","Lebanon"],["LS","Lesotho"],["LR","Liberia"],["LY","Libya"],["LI","Liechtenstein"],["LT","Lithuania"],["LU","Luxembourg"],["MO","Macao"],["MG","Madagascar"],["MW","Malawi"],["MY","Malaysia"],["MV","Maldives"],["ML","Mali"],["MT","Malta"],["MH","Marshall Islands"],["MR","Mauritania"],["MU","Mauritius"],["MX","Mexico"],["FM","Micronesia"],["MD","Moldova"],["MC","Monaco"],["MN","Mongolia"],["ME","Montenegro"],["MS","Montserrat"],["MA","Morocco"],["MZ","Mozambique"],["MM","Myanmar"],["NA","Namibia"],["NR","Nauru"],["NP","Nepal"],["NL","Netherlands"],["NC","New Caledonia"],["NZ","New Zealand"],["NI","Nicaragua"],["NE","Niger"],["NG","Nigeria"],["NO","Norway"],["OM","Oman"],["PK","Pakistan"],["PW","Palau"],["PS","Palestine"],["PA","Panama"],["PG","Papua New Guinea"],["PY","Paraguay"],["PE","Peru"],["PH","Philippines"],["PL","Poland"],["PT","Portugal"],["PR","Puerto Rico"],["QA","Qatar"],["RO","Romania"],["RU","Russia"],["RW","Rwanda"],["KN","Saint Kitts & Nevis"],["LC","Saint Lucia"],["VC","Saint Vincent & Grenadines"],["WS","Samoa"],["SM","San Marino"],["ST","São Tomé & Príncipe"],["SA","Saudi Arabia"],["SN","Senegal"],["RS","Serbia"],["SC","Seychelles"],["SL","Sierra Leone"],["SG","Singapore"],["SK","Slovakia"],["SI","Slovenia"],["SB","Solomon Islands"],["SO","Somalia"],["ZA","South Africa"],["KR","South Korea"],["SS","South Sudan"],["ES","Spain"],["LK","Sri Lanka"],["SD","Sudan"],["SR","Suriname"],["SE","Sweden"],["CH","Switzerland"],["SY","Syria"],["TW","Taiwan"],["TJ","Tajikistan"],["TZ","Tanzania"],["TH","Thailand"],["TL","Timor-Leste"],["TG","Togo"],["TO","Tonga"],["TT","Trinidad & Tobago"],["TN","Tunisia"],["TR","Turkey"],["TM","Turkmenistan"],["TV","Tuvalu"],["UG","Uganda"],["UA","Ukraine"],["AE","United Arab Emirates"],["GB","United Kingdom"],["US","United States"],["UY","Uruguay"],["UZ","Uzbekistan"],["VU","Vanuatu"],["VA","Vatican City"],["VE","Venezuela"],["VN","Vietnam"],["YE","Yemen"],["ZM","Zambia"],["ZW","Zimbabwe"]];

function getFlagEmoji(code) {
  return String.fromCodePoint(...code.toUpperCase().split("").map(c => 0x1F1E6 - 65 + c.charCodeAt(0)));
}
const allCountries = countryData.map(([code, name]) => ({ name, emoji: getFlagEmoji(code), code }));

const LEVELS = [
  { name: "Beginner Lands",  icon:"🌿", timerSec: 0,  sub:"Relaxed · No timer" },
  { name: "Knowledge Coast", icon:"📘", timerSec: 20, sub:"20 second challenge" },
  { name: "Storm Desert",    icon:"🔥", timerSec: 12, sub:"12 second challenge" },
  { name: "Shadow Peaks",    icon:"💀", timerSec: 8,  sub:"8 second challenge" },
  { name: "Final Frontier",  icon:"⚠️", timerSec: 5,  sub:"5 seconds · Are you ready?" },
];

const NODE_POSITIONS = [{x:55,y:275},{x:125,y:210},{x:205,y:168},{x:285,y:115},{x:360,y:65}];

const popularityCodes = {
  US:10,GB:10,FR:10,DE:10,JP:10,CN:10,AU:10,BR:10,CA:10,IN:10,
  IT:9,ES:9,MX:9,RU:9,KR:9,AR:9,ZA:9,EG:9,TR:9,SA:9,
  NG:8,TH:8,ID:8,PK:8,PH:8,NL:8,SE:8,NO:8,CH:8,PT:8,
  GR:8,PL:8,UA:8,IR:8,IQ:8,IL:8,AE:8,VN:8,MY:8,SG:8,
  DK:7,FI:7,AT:7,BE:7,CZ:7,HU:7,RO:7,CL:7,CO:7,PE:7,
  VE:7,CU:7,KE:7,ET:7,TZ:7,GH:7,CM:7,CI:7,MA:7,TN:7,
  LY:7,SD:7,AO:7,DZ:7,BY:7,KZ:7,UZ:7,AF:7,NP:7,BD:7,
  LK:6,MM:6,KH:6,LA:6,MN:6,GE:6,AM:6,AZ:6,HN:6,GT:6,
  SV:6,NI:6,CR:6,PA:6,BO:6,PY:6,UY:6,EC:6,JM:6,TT:6,
  HR:6,RS:6,SI:6,SK:6,BG:6,LT:6,LV:6,EE:6,MD:6,BA:6,
  AL:5,MK:5,ME:5,XK:5,IS:5,LU:5,MT:5,CY:5,IE:5,NZ:5,
  BW:5,ZM:5,ZW:5,UG:5,RW:5,SN:5,MZ:5,NA:5,MG:5,ML:5,
  BF:5,TD:5,NE:5,BJ:5,TG:5,GA:5,CG:5,CD:5,CF:5,SS:5,
  SO:5,DJ:5,ER:5,MR:5,GM:5,GN:5,GW:5,SL:5,LR:5,GQ:5,
  OM:4,QA:4,KW:4,BH:4,JO:4,YE:4,SY:4,LB:4,PS:4,HT:4,
  DO:4,CU:4,BB:4,TW:4,HK:4,MO:4,PG:4,FJ:4,SB:4,VU:4,
  TO:4,WS:4,FM:4,PW:4,MH:4,KI:4,NR:4,TV:4,ST:4,CV:4,
  SC:4,MU:4,MV:4,BT:4,KG:4,TJ:4,TM:4,GY:4,SR:4,BZ:4,
  PF:3,NC:3,GL:3,FO:3,BM:3,KY:3,VG:3,AI:3,MS:3,CW:3,
  PR:3,GD:3,LC:3,VC:3,KN:3,AG:3,DM:3,KM:3,CK:3,IO:3,
  SM:3,MC:3,LI:3,VA:3,AD:3,SZ:3,LS:3,SS:2,AX:1,
};
function getPopularity(code) { return popularityCodes[code] || 3; }

function shuffle(arr) { return [...arr].sort(() => Math.random() - 0.5); }

// Split all countries into 5 popularity tiers (famous → obscure), one per level.
// Computed once at module load, exactly like the HTML's buildLevelPools().
function buildLevelPools() {
  const sorted = [...allCountries].sort((a, b) => getPopularity(b.code) - getPopularity(a.code));
  const total = sorted.length;
  const chunk = Math.ceil(total / 5);
  return [0,1,2,3,4].map(i => shuffle(sorted.slice(i * chunk, (i + 1) * chunk)));
}
const levelPools = buildLevelPools();

function buildOptions(country) {
  const wrong = shuffle(allCountries.filter(c => c.name !== country.name)).slice(0, 3);
  return shuffle([country.name, ...wrong.map(c => c.name)]);
}

// ═══════════════════════════════════════════════
// FLAGMASTER PREMIUM · Luxury Cartography Theme
// (ported 1:1 from flagmaster-premium.html)
// ═══════════════════════════════════════════════
const THEME_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700;900&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,400&family=DM+Mono:wght@400;500&display=swap');

.fm-root {
  --navy:#0b1628; --navy-2:#112240; --navy-3:#1a3358;
  --gold:#c9a84c; --gold-2:#e8c97a; --gold-3:#f5e1a0;
  --cream:#f9f3e3; --cream-2:#f0e6c8; --ink:#1c2a3a;
  --rust:#b34a2b; --teal:#2a7c6f; --parchment:#fdf6e3;

  --theme-body-bg:#0b1628;
  --theme-card-bg: linear-gradient(160deg, rgba(253,246,227,0.97) 0%, rgba(240,230,200,0.97) 100%);
  --theme-card-color:#1c2a3a;
  --theme-passport-bg:#fdf6e3;
  --theme-field-bg: rgba(255,255,255,0.7);
  --theme-field-focus-bg: white;
  --theme-field-color:#0b1628;
  --theme-stat-pill-bg:#112240;
  --theme-option-bg: rgba(253,246,227,0.9);
  --theme-option-hover-bg: white;
  --theme-region-btn-bg: rgba(253,246,227,0.92);
  --theme-msg-bg: rgba(11,22,40,0.06);
  --theme-body-text: rgba(28,42,58,0.85);
  --theme-sub-color: rgba(26,51,88,0.45);
  --theme-bg-overlay: radial-gradient(ellipse 80% 60% at 20% 10%, rgba(42,124,111,0.07) 0%, transparent 60%),
                      radial-gradient(ellipse 60% 80% at 80% 90%, rgba(179,74,43,0.06) 0%, transparent 60%),
                      radial-gradient(ellipse 100% 100% at 50% 50%, #112240 0%, #0b1628 70%);

  font-family: 'Cormorant Garamond', Georgia, serif;
  background: var(--theme-body-bg);
  color: var(--cream);
  min-height: 100vh;
  display: flex; justify-content: center; align-items: flex-start;
  padding: 24px 16px 48px; position: relative; overflow-x: hidden;
}
.fm-root.fm-dark {
  --theme-body-bg:#05070d;
  --theme-card-bg: linear-gradient(160deg, rgba(18,22,38,0.98) 0%, rgba(12,16,28,0.98) 100%);
  --theme-card-color:#d4daf0;
  --theme-passport-bg:#0e1220;
  --theme-field-bg: rgba(255,255,255,0.06);
  --theme-field-focus-bg: rgba(255,255,255,0.1);
  --theme-field-color:#d4daf0;
  --theme-stat-pill-bg: rgba(255,255,255,0.04);
  --theme-option-bg: rgba(255,255,255,0.05);
  --theme-option-hover-bg: rgba(255,255,255,0.09);
  --theme-region-btn-bg: rgba(255,255,255,0.07);
  --theme-msg-bg: rgba(255,255,255,0.04);
  --theme-body-text: rgba(212,218,240,0.8);
  --theme-sub-color: rgba(212,218,240,0.4);
  --theme-bg-overlay: radial-gradient(ellipse 80% 60% at 20% 10%, rgba(42,124,111,0.12) 0%, transparent 60%),
                      radial-gradient(ellipse 60% 80% at 80% 90%, rgba(42,157,143,0.08) 0%, transparent 60%),
                      radial-gradient(ellipse 100% 100% at 50% 50%, #080c1a 0%, #05070d 70%);
}
.fm-root * { box-sizing: border-box; }
.fm-bg-layer { position: fixed; inset: 0; z-index: 0; background: var(--theme-bg-overlay); transition: background .4s ease; }

.fm-theme-toggle {
  position: fixed; top: 16px; right: 16px; z-index: 50;
  width: 44px; height: 44px; border-radius: 50%;
  border: 1px solid rgba(201,168,76,0.3); cursor: pointer;
  background: rgba(11,22,40,0.7); backdrop-filter: blur(12px);
  color: white; font-size: 18px;
  transition: transform .2s ease, box-shadow .2s ease;
  box-shadow: 0 4px 16px rgba(0,0,0,0.4);
  display: flex; align-items: center; justify-content: center;
}
.fm-theme-toggle:hover { transform: scale(1.1); }
.fm-theme-toggle:active { transform: scale(0.95); }

.fm-screen { width: 100%; max-width: 580px; position: relative; z-index: 2; animation: fm-screenIn .4s cubic-bezier(.2,.9,.3,1); margin: 0 auto; }
@keyframes fm-screenIn { from { opacity:0; transform:translateY(28px) scale(.98); } to { opacity:1; transform:none; } }

.fm-card {
  background: var(--theme-card-bg); border-radius: 4px;
  border: 1px solid rgba(201,168,76,0.25);
  box-shadow: 0 20px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05);
  color: var(--theme-card-color); overflow: hidden; position: relative;
  animation: fm-floatCard 6s ease-in-out infinite;
  transition: background .4s ease, color .4s ease;
}
.fm-card::before, .fm-card::after { content:""; position:absolute; width:40px; height:40px; border-color: rgba(201,168,76,0.4); border-style: solid; opacity:.5; }
.fm-card::before { top:12px; left:12px; border-width:2px 0 0 2px; }
.fm-card::after  { bottom:12px; right:12px; border-width:0 2px 2px 0; }
@keyframes fm-floatCard { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }
.fm-card-inner { padding: 48px 40px; text-align: center; }
@media (max-width:480px) { .fm-card-inner { padding: 32px 24px 36px; } }

.fm-display-title { font-family:'Cinzel',serif; font-weight:900; font-size: clamp(1.6rem,5vw,2.2rem); letter-spacing:.06em; color: var(--theme-card-color); line-height:1.1; margin:0; }
.fm-display-sub { font-family:'DM Mono',monospace; font-size:.65rem; letter-spacing:.2em; text-transform:uppercase; color: var(--theme-sub-color); margin:6px 0 0; }
.fm-body-text { font-family:'Cormorant Garamond',serif; font-size:1rem; line-height:1.6; color: var(--theme-body-text); margin: 20px 0 8px; }
.fm-mono { font-family:'DM Mono',monospace; font-size:.8rem; color: var(--theme-sub-color); }

.fm-emblem { font-size:4rem; margin:8px 0 4px; filter: drop-shadow(0 4px 12px rgba(201,168,76,0.2)); animation: fm-emblemFloat 5s ease-in-out infinite; display:inline-block; }
@keyframes fm-emblemFloat { 0%,100% { transform: translateY(0) rotate(-1deg); } 50% { transform: translateY(-6px) rotate(1deg); } }
.fm-welcome-flags { font-size:1.8rem; letter-spacing:6px; margin:20px 0; line-height:2; opacity:.8; }

.fm-ornament-divider { display:flex; align-items:center; gap:12px; margin:28px 0; color: rgba(201,168,76,0.5); font-size:1rem; }
.fm-ornament-divider::before, .fm-ornament-divider::after { content:""; flex:1; height:1px; background: linear-gradient(90deg, transparent, rgba(201,168,76,0.3), transparent); }

.fm-btn-expedition {
  font-family:'Cinzel',serif; font-size:.85rem; font-weight:700; letter-spacing:.12em; text-transform:uppercase;
  padding:14px 32px; background: var(--gold); color: var(--navy); border:none; border-radius:2px; cursor:pointer;
  transition: transform .08s ease, box-shadow .08s ease, background .2s ease;
  box-shadow: 0 6px 20px rgba(0,0,0,0.4); width:100%; position:relative; overflow:hidden;
}
.fm-btn-expedition::after { content:""; position:absolute; top:0; left:-120%; width:60%; height:100%; background: linear-gradient(120deg, transparent, rgba(255,255,255,0.25), transparent); transform: skewX(-20deg); }
.fm-btn-expedition:hover::after { animation: fm-shineSweep .9s ease; }
.fm-btn-expedition:hover { background: var(--gold-2); box-shadow: 0 8px 28px rgba(0,0,0,0.5); }
.fm-btn-expedition:active { transform: translateY(3px) scale(.98); box-shadow: 0 2px 6px rgba(0,0,0,0.4) !important; }
@keyframes fm-shineSweep { to { left:140%; } }

.fm-btn-ghost {
  font-family:'Cinzel',serif; font-size:.75rem; letter-spacing:.1em; text-transform:uppercase;
  padding:11px 24px; background: transparent; color: var(--theme-card-color);
  border:1px solid rgba(201,168,76,0.25); border-radius:2px; cursor:pointer;
  transition: transform .08s ease, box-shadow .08s ease, background .2s ease; width:100%;
}
.fm-btn-ghost:hover { background: rgba(201,168,76,0.08); border-color: rgba(201,168,76,0.4); }
.fm-btn-ghost:active { transform: translateY(3px) scale(.98); }

.fm-btn-sm {
  font-family:'Cinzel',serif; font-size:.65rem; letter-spacing:.08em; text-transform:uppercase;
  padding:8px 16px; background: var(--navy-2); color: var(--gold-3);
  border:1px solid rgba(201,168,76,0.15); border-radius:2px; cursor:pointer;
  transition: transform .08s ease, background .2s ease;
}
.fm-btn-sm:hover { background: var(--navy-3); }
.fm-btn-sm:active { transform: translateY(2px) scale(.98); }
.fm-btn-sm:disabled { opacity:.4; cursor:not-allowed; }

.fm-nav-row { display:flex; gap:10px; margin-bottom:20px; }

.fm-passport { background: var(--theme-passport-bg); border:2px solid rgba(201,168,76,0.35); border-radius:12px; padding:28px 24px 24px; margin:20px 0; position:relative; box-shadow: inset 0 0 30px rgba(0,0,0,0.12), 0 10px 30px rgba(0,0,0,0.2); transition: background .4s ease; text-align:left; }
.fm-passport-header { font-family:'Cinzel',serif; font-size:.9rem; font-weight:700; letter-spacing:.2em; color: var(--theme-card-color); text-align:center; margin-bottom:20px; }
.fm-field-group { margin-bottom:16px; }
.fm-field-label { font-family:'DM Mono',monospace; font-size:.6rem; letter-spacing:.2em; text-transform:uppercase; color: var(--theme-sub-color); margin-bottom:6px; display:block; }
.fm-field-input { width:100%; padding:11px 16px; background: var(--theme-field-bg); border:1px solid rgba(201,168,76,0.3); border-radius:2px; font-family:'Cormorant Garamond',serif; font-size:1rem; color: var(--theme-field-color); transition: all .2s; outline:none; }
.fm-field-input:focus { border-color: var(--gold); box-shadow: 0 0 0 3px rgba(201,168,76,0.1); background: var(--theme-field-focus-bg); }
.fm-field-input.fm-shake { animation: fm-wrongShake .3s ease; border-color: #c0392b !important; }
select.fm-field-input { cursor:pointer; }
.fm-flag-preview-area { text-align:center; padding:12px; background: rgba(201,168,76,0.06); border:1px dashed rgba(201,168,76,0.3); border-radius:2px; margin-top:12px; }
.fm-flag-preview-area .fm-flag-big { font-size:3rem; display:inline-block; filter: drop-shadow(0 4px 8px rgba(0,0,0,0.2)); transition: transform .3s cubic-bezier(.2,.9,.3,1.2); }
.fm-flag-preview-area .fm-flag-name { font-family:'DM Mono',monospace; font-size:.65rem; letter-spacing:.15em; color: var(--theme-sub-color); margin-top:4px; }
.fm-stamp-verified { font-family:'Cinzel',serif; font-size:.6rem; letter-spacing:.25em; color: var(--teal); border:2px solid var(--teal); display:inline-block; padding:3px 10px; transform: rotate(-8deg); opacity:.7; margin-top:8px; border-radius:2px; }

.fm-stat-strip { display:flex; gap:10px; margin-bottom:20px; }
.fm-stat-pill { flex:1; background: var(--theme-stat-pill-bg); border:1px solid rgba(201,168,76,0.2); border-radius:2px; padding:8px 12px; text-align:center; }
.fm-stat-pill .fm-stat-val { font-family:'Cinzel',serif; font-size:1.1rem; font-weight:700; color: var(--gold-2); display:block; }
.fm-stat-pill .fm-stat-lbl { font-family:'DM Mono',monospace; font-size:.55rem; letter-spacing:.15em; color: rgba(201,168,76,0.5); display:block; margin-top:2px; }

.fm-progress-track { width:100%; height:4px; background: rgba(26,51,88,0.15); border-radius:2px; margin-bottom:20px; overflow:hidden; }
.fm-progress-fill { height:100%; background: linear-gradient(90deg, var(--gold), var(--gold-2)); border-radius:2px; transition: width .4s ease; }
.fm-timer-track { width:100%; height:3px; background: rgba(179,74,43,0.15); border-radius:2px; margin-bottom:16px; overflow:hidden; }
.fm-timer-fill { height:100%; background: linear-gradient(90deg, #e74c3c, #c0392b); border-radius:2px; transition: width 1s linear; }

.fm-flag-stage { position:relative; width:260px; height:180px; margin:0 auto 12px; border-radius:4px; overflow:hidden; border:2px solid rgba(201,168,76,0.2); box-shadow: 0 20px 60px rgba(0,0,0,0.6); background: var(--navy-2); }
.fm-flag-emoji-display { font-size:90px; width:100%; height:100%; display:flex; align-items:center; justify-content:center; background: radial-gradient(circle, rgba(253,246,227,0.05), transparent); filter: drop-shadow(0 4px 12px rgba(0,0,0,0.3)); }
@media (max-width:480px) { .fm-flag-stage { width:220px; height:155px; } .fm-flag-emoji-display { font-size:75px; } }

.fm-mask-tile { position:absolute; width:50%; height:50%; z-index:10; display:flex; align-items:center; justify-content:center; font-family:'Cinzel',serif; font-size:.65rem; font-weight:700; letter-spacing:.15em; color: rgba(255,255,255,0.7); transition: opacity .4s ease, transform .4s cubic-bezier(.2,.9,.3,1); }
.fm-mask-1 { top:0; left:0; background: linear-gradient(135deg,#8b1a1a,#c0392b); }
.fm-mask-2 { top:0; right:0; background: linear-gradient(135deg,#1a3a6b,#1e6091); }
.fm-mask-3 { bottom:0; left:0; background: linear-gradient(135deg,#6b5a1a,#c9a84c); color: rgba(0,0,0,0.5); }
.fm-mask-4 { bottom:0; right:0; background: linear-gradient(135deg,#1a5a4a,#2a9d8f); }
.fm-mask-tile.fm-revealed { animation: fm-revealPop .5s cubic-bezier(.2,.9,.3,1.4) forwards; pointer-events:none; }
@keyframes fm-revealPop { 0% { transform: scale(1); opacity:1; } 60% { transform: scale(1.15); opacity:.7; } 100% { transform: scale(.6); opacity:0; } }

.fm-reveal-grid { display:grid; grid-template-columns: repeat(4,1fr); gap:8px; margin: 8px 0 20px; }
.fm-reveal-btn { padding:10px 4px; border:none; border-radius:2px; font-family:'Cinzel',serif; font-size:.6rem; font-weight:700; letter-spacing:.1em; text-transform:uppercase; cursor:pointer; transition: transform .08s ease; }
.fm-reveal-btn:active:not(:disabled) { transform: translateY(3px) scale(.98); }
.fm-reveal-btn:disabled { opacity:.4; cursor:not-allowed; }
.fm-rb-red  { background:#c0392b; color:#fff; box-shadow: 0 3px 0 #8b1a1a; }
.fm-rb-blue { background:#1e6091; color:#fff; box-shadow: 0 3px 0 #1a3a6b; }
.fm-rb-gold { background:#c9a84c; color: var(--navy); box-shadow: 0 3px 0 #8b6a1a; }
.fm-rb-teal { background:#2a9d8f; color:#fff; box-shadow: 0 3px 0 #1a5a4a; }

.fm-options-grid { display:flex; flex-direction:column; gap:8px; margin-bottom:16px; }
.fm-option-btn { width:100%; padding:13px 20px; background: var(--theme-option-bg); border:1px solid rgba(201,168,76,0.2); border-radius:2px; font-family:'Cormorant Garamond',serif; font-size:1.05rem; font-weight:600; color: var(--theme-card-color); cursor:pointer; transition: transform .08s ease, background .15s ease, border-color .15s ease, padding-left .15s ease; text-align:left; position:relative; overflow:hidden; }
.fm-option-btn::before { content:""; position:absolute; left:0; top:0; bottom:0; width:3px; background: var(--gold); transform: scaleY(0); transition: transform .15s; transform-origin: bottom; }
.fm-option-btn:not(:disabled):hover::before { transform: scaleY(1); }
.fm-option-btn:not(:disabled):hover { background: var(--theme-option-hover-bg); border-color: rgba(201,168,76,0.4); padding-left:24px; }
.fm-option-btn:disabled { cursor:default; }
.fm-option-btn.fm-correct { background:#e8f8f0; border-color:#2ecc71; color:#1a6b3a; box-shadow: 0 0 0 2px rgba(46,204,113,0.2); animation: fm-correctPulse .5s ease; }
.fm-option-btn.fm-correct::before { background:#2ecc71; transform: scaleY(1); }
.fm-option-btn.fm-wrong { background:#fdf0ee; border-color:#e74c3c; color:#8b1a1a; animation: fm-wrongShake .4s ease; }
.fm-option-btn.fm-wrong::before { background:#e74c3c; transform: scaleY(1); }
@keyframes fm-correctPulse { 0% { transform: scale(1); } 40% { transform: scale(1.03); } 100% { transform: scale(1); } }
@keyframes fm-wrongShake { 0%,100% { transform: translateX(0); } 20% { transform: translateX(-8px); } 40% { transform: translateX(8px); } 60% { transform: translateX(-6px); } 80% { transform: translateX(6px); } }

.fm-message-panel { background: var(--theme-msg-bg); border:1px solid rgba(201,168,76,0.15); border-radius:2px; padding:12px 16px; font-family:'Cormorant Garamond',serif; font-size:.95rem; color: var(--theme-card-color); min-height:44px; line-height:1.5; transition: background .3s ease; }
.fm-message-panel.fm-msg-correct { background: rgba(46,204,113,0.08); border-color: rgba(46,204,113,0.3); color:#1a6b3a; }
.fm-message-panel.fm-msg-wrong { background: rgba(231,76,60,0.08); border-color: rgba(231,76,60,0.3); color:#8b1a1a; }

.fm-map-frame { position:relative; width:100%; height:340px; background: radial-gradient(circle at 50% 50%, #1a3358, #0b1628); border-radius:2px; margin:20px 0; overflow:hidden; box-shadow: inset 0 0 40px rgba(0,0,0,0.5), 0 8px 32px rgba(0,0,0,0.3); }
.fm-map-node { position:absolute; width:56px; height:56px; border-radius:50%; background: rgba(17,34,64,0.85); border:2px solid rgba(201,168,76,0.4); display:flex; flex-direction:column; align-items:center; justify-content:center; font-size:1.6rem; transform: translate(-50%,-50%); cursor:pointer; transition: all .25s cubic-bezier(.2,.9,.3,1.2); z-index:5; box-shadow: 0 4px 16px rgba(0,0,0,0.4); }
.fm-map-node.fm-breathe { animation: fm-breathe 3s ease-in-out infinite; }
@keyframes fm-breathe { 0%,100% { transform: translate(-50%,-50%) scale(1); } 50% { transform: translate(-50%,-50%) scale(1.05); } }
.fm-map-node.fm-node-completed { background: rgba(42,157,143,0.3); border-color:#2a9d8f; box-shadow: 0 0 20px rgba(42,157,143,0.5), 0 4px 16px rgba(0,0,0,0.3); animation: fm-nodePulse 2.5s ease-in-out infinite; }
@keyframes fm-nodePulse { 0%,100% { box-shadow: 0 0 20px rgba(42,157,143,0.5), 0 4px 16px rgba(0,0,0,0.3); } 50% { box-shadow: 0 0 35px rgba(42,157,143,0.8), 0 4px 16px rgba(0,0,0,0.3); } }
.fm-map-node.fm-node-current { border-color: gold; box-shadow: 0 0 25px gold, 0 4px 16px rgba(0,0,0,0.4); transform: translate(-50%,-50%) scale(1.12); }
.fm-map-node.fm-node-locked { opacity:.3; filter: grayscale(1); cursor: not-allowed; border-color: rgba(100,100,100,0.3); }
.fm-node-label { font-family:'DM Mono',monospace; font-size:.5rem; letter-spacing:.08em; color: rgba(201,168,76,0.8); background: rgba(0,0,0,0.5); padding:2px 5px; border-radius:1px; margin-top:4px; white-space:nowrap; pointer-events:none; }
.fm-player-marker { position:absolute; font-size:1.8rem; transform: translate(-50%,-50%); transition: all 1.3s cubic-bezier(.2,.9,.2,1); z-index:20; filter: drop-shadow(0 0 10px gold); pointer-events:none; }
.fm-player-pulse { position:absolute; width:20px; height:20px; border-radius:50%; background: rgba(201,168,76,0.3); transform: translate(-50%,-50%); animation: fm-playerPulse 2s ease-out infinite; pointer-events:none; z-index:19; }
@keyframes fm-playerPulse { 0% { width:20px; height:20px; opacity:.8; } 100% { width:60px; height:60px; opacity:0; } }

.fm-region-btn { width:100%; padding:16px 20px; margin-bottom:10px; border-radius:2px; font-family:'Cinzel',serif; font-size:.85rem; font-weight:600; letter-spacing:.08em; text-align:left; cursor:pointer; border:1px solid rgba(201,168,76,0.2); background: rgba(201,168,76,0.05); color: rgba(201,168,76,0.4); pointer-events:none; opacity:.45; transition: all .2s; position:relative; }
.fm-region-btn.fm-region-unlocked { background: var(--theme-region-btn-bg); color: var(--theme-card-color); border-color: rgba(201,168,76,0.4); pointer-events:all; opacity:1; cursor:pointer; }
.fm-region-btn.fm-region-unlocked:hover { background: var(--theme-option-hover-bg); border-color: var(--gold); transform: translateX(4px); box-shadow: -4px 0 0 var(--gold); }
.fm-region-meta { font-family:'DM Mono',monospace; font-size:.6rem; letter-spacing:.12em; color: var(--theme-sub-color); margin-top:4px; display:block; }
.fm-region-lock-icon { position:absolute; right:16px; top:50%; transform: translateY(-50%); font-size:.9rem; opacity:.4; }

.fm-pause-overlay { position:fixed; inset:0; background: rgba(11,22,40,0.92); backdrop-filter: blur(10px); z-index:999; display:flex; justify-content:center; align-items:center; flex-direction:column; }
.fm-pause-content { text-align:center; border:1px solid rgba(201,168,76,0.3); padding:48px; border-radius:4px; background: rgba(253,246,227,0.04); }
.fm-pause-title { font-family:'Cinzel',serif; font-size:2rem; font-weight:900; color: var(--gold-2); letter-spacing:.2em; margin-bottom:8px; }
.fm-pause-sub { font-family:'Cormorant Garamond',serif; color: rgba(201,168,76,0.6); margin-bottom:24px; letter-spacing:.1em; font-size:.9rem; }
`;

const Style = () => <style>{THEME_CSS}</style>;

export default function Flagmaster({ onComplete }) {
  const [screen, setScreen] = useState("welcome"); // welcome | title | worldMap | levelSelect | game
  const [darkMode, setDarkMode] = useState(false);

  // Passport
  const [nameInput, setNameInput] = useState("");
  const [ageInput, setAgeInput] = useState("");
  const [countryCode, setCountryCode] = useState("");
  const [shakeField, setShakeField] = useState(null); // 'name' | 'age' | 'country'
  const [profile, setProfile] = useState(null); // {name, age, country}

  // Progress
  const [levelCompleted, setLevelCompleted] = useState([false, false, false, false, false]);
  const [totalScore, setTotalScore] = useState(0);

  // Active level/game
  const [currentLevelIdx, setCurrentLevelIdx] = useState(0);
  const [levelQuestions, setLevelQuestions] = useState([]);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [currentCountry, setCurrentCountry] = useState(null);
  const [options, setOptions] = useState([]);
  const [revealed, setRevealed] = useState([false, false, false, false]);
  const [revealsUsed, setRevealsUsed] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [waitingForNext, setWaitingForNext] = useState(false);
  const [selected, setSelected] = useState(null);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [isPaused, setIsPaused] = useState(false);

  const advanceTimeoutRef = useRef(null);

  // Restore saved passport profile (matches localStorage.flagPlayerProfile in the HTML)
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("flagPlayerProfile"));
      if (saved) {
        setProfile(saved);
        setNameInput(saved.name); setAgeInput(String(saved.age)); setCountryCode(saved.country);
      }
    } catch (e) {}
    return () => { if (advanceTimeoutRef.current) clearTimeout(advanceTimeoutRef.current); };
  }, []);

  const lvl = LEVELS[currentLevelIdx];

  // ── PASSPORT ──
  const shake = (field) => { setShakeField(field); setTimeout(() => setShakeField(null), 500); };

  const enterGame = () => {
    const name = nameInput.trim();
    const age = parseInt(ageInput, 10);
    if (!name) { shake("name"); return; }
    if (!age || age < 5 || age > 120) { shake("age"); return; }
    if (!countryCode) { shake("country"); return; }
    const p = { name: name.slice(0, 14), age, country: countryCode };
    setProfile(p);
    try { localStorage.setItem("flagPlayerProfile", JSON.stringify(p)); } catch (e) {}
    setScreen("worldMap");
  };

  // ── NAVIGATION ──
  const stopPending = () => { if (advanceTimeoutRef.current) { clearTimeout(advanceTimeoutRef.current); advanceTimeoutRef.current = null; } };

  const goToWorldMap = () => { stopPending(); setIsPaused(false); setScreen("worldMap"); };
  const goToLevelSelect = () => setScreen("levelSelect");
  const goToTitle = () => {
    stopPending(); setIsPaused(false);
    setTotalScore(0); setLevelCompleted([false, false, false, false, false]);
    setScreen("title");
  };
  const exitToMap = () => { stopPending(); setIsPaused(false); setWaitingForNext(false); setScreen("worldMap"); };

  // ── QUESTION LOADING ──
  const loadQuestion = useCallback((levelIdx, qIdx, questions) => {
    const country = questions[qIdx];
    setCurrentCountry(country);
    setOptions(buildOptions(country));
    setRevealed([false, false, false, false]);
    setRevealsUsed(0);
    setWaitingForNext(false);
    setSelected(null);
    const t = LEVELS[levelIdx].timerSec;
    setTimeLeft(t);
    setMessage({
      text: t > 0 ? `⏱ ${LEVELS[levelIdx].name} · ${t}s per flag · Reveal sectors to gain hints` : "🌿 Relaxed mode · Identify the flag",
      type: "",
    });
  }, []);

  const startLevel = (idx) => {
    if (idx > 0 && !levelCompleted[idx - 1]) return;
    const questions = shuffle(levelPools[idx]);
    setCurrentLevelIdx(idx);
    setLevelQuestions(questions);
    setCurrentQIndex(0);
    setIsPaused(false);
    setScreen("game");
    loadQuestion(idx, 0, questions);
  };

  const finishLevel = useCallback((finalScore) => {
    setLevelCompleted(prev => {
      const next = [...prev];
      next[currentLevelIdx] = true;
      if (currentLevelIdx === LEVELS.length - 1) {
        onComplete?.(finalScore, 100);
      }
      return next;
    });
    setScreen("worldMap");
  }, [currentLevelIdx, onComplete]);

  const nextQuestion = useCallback(() => {
    setCurrentQIndex(prevIdx => {
      const nextIdx = prevIdx + 1;
      if (nextIdx < levelQuestions.length) {
        loadQuestion(currentLevelIdx, nextIdx, levelQuestions);
        return nextIdx;
      }
      setTotalScore(s => { finishLevel(s); return s; });
      return prevIdx;
    });
  }, [levelQuestions, currentLevelIdx, loadQuestion, finishLevel]);

  // ── TIMER ──
  useEffect(() => {
    if (screen !== "game" || waitingForNext || isPaused) return;
    if (lvl.timerSec <= 0) return; // relaxed mode, no timer
    if (timeLeft <= 0) {
      setWaitingForNext(true);
      setMessage({ text: "⏰ Time expired. The flag vanished.", type: "wrong" });
      advanceTimeoutRef.current = setTimeout(nextQuestion, 1300);
      return;
    }
    const t = setTimeout(() => setTimeLeft(x => x - 1), 1000);
    return () => clearTimeout(t);
  }, [screen, timeLeft, waitingForNext, isPaused, lvl.timerSec, nextQuestion]);

  // ── ANSWERING ──
  const checkAnswer = (opt) => {
    if (waitingForNext || isPaused || !currentCountry) return;
    setSelected(opt);
    setWaitingForNext(true);

    if (opt !== currentCountry.name) {
      setMessage({ text: `✗ Incorrect. The answer was ${currentCountry.name} ${currentCountry.emoji}`, type: "wrong" });
      advanceTimeoutRef.current = setTimeout(nextQuestion, 1400);
      return;
    }
    const bonus = Math.max(0, 3 - revealsUsed);
    const earned = 1 + bonus;
    setTotalScore(s => s + earned);
    setRevealed([true, true, true, true]);
    const bonusStr = bonus === 3 ? "✦ Perfect — full bonus!" : bonus === 2 ? "✦ Sharp — +2 bonus" : bonus === 1 ? "+1 bonus" : "No bonus remaining";
    setMessage({ text: `✓ Correct! +${earned} pts · ${bonusStr}`, type: "correct" });
    advanceTimeoutRef.current = setTimeout(nextQuestion, 1600);
  };

  const revealTile = (tileIdx) => {
    if (waitingForNext || isPaused || revealed[tileIdx]) return;
    setRevealed(prev => { const next = [...prev]; next[tileIdx] = true; return next; });
    setRevealsUsed(r => {
      const used = r + 1;
      const bonusLeft = Math.max(0, 3 - used);
      setMessage({ text: bonusLeft === 0 ? "⚠ All sectors revealed · No bonus remaining" : `Sector revealed · ${bonusLeft} bonus remaining`, type: "" });
      return used;
    });
  };

  const togglePause = () => {
    if (waitingForNext) return;
    setIsPaused(p => !p);
  };

  // Escape toggles pause during gameplay; Enter submits the passport form
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape" && screen === "game") togglePause();
      if (e.key === "Enter" && screen === "title") enterGame();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  });

  const furthest = (() => { let f = 0; levelCompleted.forEach((c, i) => { if (c) f = i + 1; }); return Math.min(f, 4); })();
  const nodePos = NODE_POSITIONS[furthest];

  const rootCls = `fm-root${darkMode ? " fm-dark" : ""}`;
  const ThemeToggle = () => (
    <button className="fm-theme-toggle" onClick={() => setDarkMode(d => !d)} aria-label="Toggle dark mode">
      {darkMode ? "☀️" : "🌙"}
    </button>
  );

  // ═══ WELCOME ═══
  if (screen === "welcome") return (
    <div className={rootCls}><Style /><div className="fm-bg-layer" /><ThemeToggle />
      <div className="fm-screen"><div className="fm-card"><div className="fm-card-inner">
        <div className="fm-display-sub">Est. MMXXVI · World Expedition Series</div>
        <div className="fm-emblem">🌍</div>
        <h1 className="fm-display-title">FLAGMASTER</h1>
        <p className="fm-body-text">A journey across nations. A test of cartographic mastery. Every flag is a territory to conquer.</p>
        <div className="fm-ornament-divider">✦</div>
        <div className="fm-welcome-flags">🇫🇷 🇯🇵 🇧🇷 🇳🇬 🇦🇺<br />🇮🇳 🇩🇪 🇲🇽 🇿🇦 🇨🇦</div>
        <div className="fm-ornament-divider">✦</div>
        <button className="fm-btn-expedition" style={{ maxWidth: 280, margin: "0 auto" }} onClick={() => setScreen("title")}>Begin Expedition →</button>
        <p className="fm-mono" style={{ marginTop: 16 }}>Press Enter to continue</p>
      </div></div></div>
    </div>
  );

  // ═══ PASSPORT / TITLE ═══
  if (screen === "title") {
    const preview = countryCode ? allCountries.find(c => c.code === countryCode) : null;
    return (
      <div className={rootCls}><Style /><div className="fm-bg-layer" /><ThemeToggle />
        <div className="fm-screen"><div className="fm-card"><div className="fm-card-inner">
          <div className="fm-display-sub">Expedition Registration</div>
          <h2 className="fm-display-title">ISSUE PASSPORT</h2>
          <div className="fm-passport">
            <div className="fm-passport-header">🛂 GLOBAL EXPEDITION PASSPORT</div>
            <div className="fm-field-group">
              <label className="fm-field-label">Explorer Name</label>
              <input
                className={`fm-field-input ${shakeField === "name" ? "fm-shake" : ""}`}
                type="text" maxLength={20} placeholder="e.g. ShadowFox"
                value={nameInput} onChange={e => setNameInput(e.target.value)}
              />
            </div>
            <div className="fm-field-group">
              <label className="fm-field-label">Age</label>
              <input
                className={`fm-field-input ${shakeField === "age" ? "fm-shake" : ""}`}
                type="number" min={5} max={120} placeholder="e.g. 16"
                value={ageInput} onChange={e => setAgeInput(e.target.value)}
              />
            </div>
            <div className="fm-field-group">
              <label className="fm-field-label">Home Nation</label>
              <select
                className={`fm-field-input ${shakeField === "country" ? "fm-shake" : ""}`}
                value={countryCode} onChange={e => setCountryCode(e.target.value)}
              >
                <option value="">— Select Nation —</option>
                {countryData.map(([code, name]) => (
                  <option key={code} value={code}>{getFlagEmoji(code)} {name}</option>
                ))}
              </select>
            </div>
            <div className="fm-flag-preview-area">
              <div className="fm-flag-big">{preview ? preview.emoji : "🌍"}</div>
              <div className="fm-flag-name">{preview ? preview.name.toUpperCase() : "SELECT YOUR NATION"}</div>
              <div className="fm-stamp-verified">✓ VERIFIED</div>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <button className="fm-btn-expedition" onClick={enterGame}>Issue Passport ›</button>
            <button className="fm-btn-ghost" onClick={() => setDarkMode(d => !d)}>Toggle Dark Mode</button>
          </div>
        </div></div></div>
      </div>
    );
  }

  // ═══ WORLD MAP ═══
  if (screen === "worldMap") return (
    <div className={rootCls}><Style /><div className="fm-bg-layer" /><ThemeToggle />
      <div className="fm-screen"><div className="fm-card"><div className="fm-card-inner">
        <div className="fm-display-sub">Expedition Progress</div>
        <h2 className="fm-display-title">WORLD PROGRESSION</h2>
        {profile && (
          <div className="fm-mono" style={{ margin: "8px 0 4px" }}>
            {getFlagEmoji(profile.country)} {profile.name.toUpperCase()} · Age {profile.age} · {totalScore} pts
          </div>
        )}
        <div className="fm-map-frame">
          <svg width="100%" height="100%" style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 2 }}>
            <defs>
              <linearGradient id="fmRouteGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#2a9d8f" stopOpacity="0.7" />
                <stop offset="50%" stopColor="#c9a84c" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#c0392b" stopOpacity="0.7" />
              </linearGradient>
            </defs>
            <path d="M55 275 L125 210 L205 168 L285 115 L360 65" stroke="url(#fmRouteGrad)" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.8" />
          </svg>
          {LEVELS.map((level, i) => {
            const completed = !!levelCompleted[i];
            const locked = i > 0 && !levelCompleted[i - 1];
            const isCurrent = !completed && !locked && i === furthest;
            const pos = NODE_POSITIONS[i];
            return (
              <div
                key={i}
                className={`fm-map-node ${completed ? "fm-node-completed" : ""} ${locked ? "fm-node-locked" : ""} ${isCurrent ? "fm-node-current" : ""} ${!completed && !locked ? "fm-breathe" : ""}`}
                style={{ left: pos.x, top: pos.y }}
                onClick={() => !locked && startLevel(i)}
              >
                {level.icon}
                <div className="fm-node-label">{level.name.split(" ")[0].toUpperCase()}</div>
              </div>
            );
          })}
          <div className="fm-player-marker" style={{ left: nodePos.x, top: nodePos.y }}>🚩</div>
          <div className="fm-player-pulse" style={{ left: nodePos.x, top: nodePos.y }} />
        </div>
        <p className="fm-mono" style={{ fontSize: "0.6rem", textAlign: "center", marginBottom: 20 }}>
          ✦ Completed regions glow teal · Click a node to enter that region
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <button className="fm-btn-expedition" onClick={goToLevelSelect}>Enter Mission Map ›</button>
          <button className="fm-btn-ghost" onClick={goToTitle}>← Return to Title</button>
        </div>
      </div></div></div>
    </div>
  );

  // ═══ LEVEL SELECT ═══
  if (screen === "levelSelect") return (
    <div className={rootCls}><Style /><div className="fm-bg-layer" /><ThemeToggle />
      <div className="fm-screen"><div className="fm-card"><div className="fm-card-inner">
        <div className="fm-nav-row"><button className="fm-btn-sm" onClick={goToWorldMap}>← World Map</button></div>
        <div className="fm-display-sub">Mission Select</div>
        <h2 className="fm-display-title">SELECT REGION</h2>
        {profile && (
          <div className="fm-mono" style={{ fontSize: "0.65rem", margin: "8px 0 20px" }}>
            {getFlagEmoji(profile.country)} {profile.name.toUpperCase()} · Choose an unlocked region
          </div>
        )}
        <div>
          {LEVELS.map((level, i) => {
            const unlocked = i === 0 || levelCompleted[i - 1];
            return (
              <button
                key={i}
                className={`fm-region-btn ${unlocked ? "fm-region-unlocked" : ""}`}
                onClick={() => unlocked && startLevel(i)}
              >
                {level.icon} {level.name}
                <span className="fm-region-meta">{level.sub}</span>
                <span className="fm-region-lock-icon">{unlocked ? (levelCompleted[i] ? "✓" : "→") : "🔒"}</span>
              </button>
            );
          })}
        </div>
        <div className="fm-stat-strip" style={{ marginTop: 20 }}>
          <div className="fm-stat-pill"><span className="fm-stat-val">{totalScore}</span><span className="fm-stat-lbl">TOTAL SCORE</span></div>
        </div>
      </div></div></div>
    </div>
  );

  // ═══ GAME ═══
  if (!currentCountry) return null;
  const timerPct = lvl.timerSec > 0 ? (timeLeft / lvl.timerSec) * 100 : 100;
  const bonusLeft = Math.max(0, 3 - revealsUsed);

  return (
    <div className={rootCls}><Style /><div className="fm-bg-layer" /><ThemeToggle />
      {isPaused && (
        <div className="fm-pause-overlay">
          <div className="fm-pause-content">
            <div className="fm-pause-title">⏸ EXPEDITION PAUSED</div>
            <p className="fm-pause-sub">YOUR PROGRESS IS SAFE</p>
            <button className="fm-btn-expedition" style={{ maxWidth: 200 }} onClick={togglePause}>Resume ›</button>
          </div>
        </div>
      )}
      <div className="fm-screen"><div className="fm-card"><div className="fm-card-inner">
        <div className="fm-nav-row">
          <button className="fm-btn-sm" onClick={exitToMap}>← Exit Region</button>
          <button className="fm-btn-sm" onClick={togglePause} disabled={waitingForNext}>⏸ Pause</button>
        </div>

        <div className="fm-stat-strip">
          <div className="fm-stat-pill"><span className="fm-stat-val">{totalScore}</span><span className="fm-stat-lbl">Score</span></div>
          <div className="fm-stat-pill"><span className="fm-stat-val">{revealsUsed}</span><span className="fm-stat-lbl">Reveals</span></div>
          <div className="fm-stat-pill"><span className="fm-stat-val">+{bonusLeft}</span><span className="fm-stat-lbl">Bonus</span></div>
        </div>

        <div className="fm-progress-track"><div className="fm-progress-fill" style={{ width: `${((currentQIndex + 1) / levelQuestions.length) * 100}%` }} /></div>
        {lvl.timerSec > 0 && (
          <div className="fm-timer-track"><div className="fm-timer-fill" style={{ width: `${timerPct}%` }} /></div>
        )}

        <div className="fm-flag-stage">
          <div className="fm-flag-emoji-display">{currentCountry.emoji}</div>
          <div className={`fm-mask-tile fm-mask-1 ${revealed[0] ? "fm-revealed" : ""}`}>I</div>
          <div className={`fm-mask-tile fm-mask-2 ${revealed[1] ? "fm-revealed" : ""}`}>II</div>
          <div className={`fm-mask-tile fm-mask-3 ${revealed[2] ? "fm-revealed" : ""}`}>III</div>
          <div className={`fm-mask-tile fm-mask-4 ${revealed[3] ? "fm-revealed" : ""}`}>IV</div>
        </div>

        <div className="fm-ornament-divider" style={{ fontSize: "0.7rem", margin: "8px 0 12px" }}>Reveal a sector · each costs −1 bonus</div>

        <div className="fm-reveal-grid">
          <button className="fm-reveal-btn fm-rb-red" disabled={waitingForNext || isPaused || revealed[0]} onClick={() => revealTile(0)}>▪ I</button>
          <button className="fm-reveal-btn fm-rb-blue" disabled={waitingForNext || isPaused || revealed[1]} onClick={() => revealTile(1)}>▪ II</button>
          <button className="fm-reveal-btn fm-rb-gold" disabled={waitingForNext || isPaused || revealed[2]} onClick={() => revealTile(2)}>▪ III</button>
          <button className="fm-reveal-btn fm-rb-teal" disabled={waitingForNext || isPaused || revealed[3]} onClick={() => revealTile(3)}>▪ IV</button>
        </div>

        <div className="fm-options-grid">
          {options.map(opt => {
            const isCorrect = waitingForNext && opt === currentCountry.name;
            const isWrong = waitingForNext && opt === selected && opt !== currentCountry.name;
            return (
              <button
                key={opt}
                disabled={waitingForNext || isPaused}
                className={`fm-option-btn ${isCorrect ? "fm-correct" : ""} ${isWrong ? "fm-wrong" : ""}`}
                onClick={() => checkAnswer(opt)}
              >
                {opt}
              </button>
            );
          })}
        </div>

        <div className={`fm-message-panel ${message.type === "correct" ? "fm-msg-correct" : message.type === "wrong" ? "fm-msg-wrong" : ""}`}>
          {message.text}
        </div>
      </div></div></div>
    </div>
  );
}