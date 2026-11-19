// "Жижигхэн гэрэл" — залуу гэр бүлийн тухай богино анимэйшн
const W = 1920, H = 1080;
const off = document.createElement('canvas'); off.width = W; off.height = H;
const octx = off.getContext('2d');

// ---------- utils ----------
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;
const ease = t => { t = clamp(t); return t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; };
const prog = (t, a, b) => ease((t - a) / (b - a));
const lin = (t, a, b) => clamp((t - a) / (b - a));
function rng(seed) { let s = seed >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }
function rr(c, x, y, w, h, r) { c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); }
function lerpCol(a, b, t) {
  const pa = a.match(/\w\w/g).map(h => parseInt(h, 16)), pb = b.match(/\w\w/g).map(h => parseInt(h, 16));
  return 'rgb(' + pa.map((v, i) => Math.round(lerp(v, pb[i], clamp(t)))).join(',') + ')';
}

// ---------- characters ----------
const SKIN = '#f2c49b', SKIN2 = '#e8b48a';
// p: {x,y,s,face(1|-1),type:'m'|'f'|'g', top, pants, walk(phase), armF, armB (rad, 0=down, + = forward),
//     mouth:'smile'|'flat'|'open'|'sad'|'grin', blink(0..1), brow:'angry'|'sad'|null, sit:'chair'|'floor'|null,
//     hat, bob, tear, headTilt, eyesClosed}
function person(c, p) {
  const s = p.s || 1, f = p.face || 1;
  c.save(); c.translate(p.x, p.y); c.scale(s * f, s);
  const walk = p.walk || 0, moving = p.walk !== undefined;
  const bob = moving ? Math.abs(Math.sin(walk)) * -8 : (p.bob || 0);
  let hipY = -150;
  if (p.sit === 'chair') hipY = -120; if (p.sit === 'floor') hipY = -30;
  const dropY = (p.sit === 'chair') ? 0 : (p.sit === 'floor' ? 0 : 0);
  c.translate(0, bob + dropY);
  const top = p.top || '#3a6ea5', pants = p.pants || '#2d3142';
  const lw = 30;
  c.lineCap = 'round'; c.lineJoin = 'round';
  // legs
  const drawLeg = (ang, col) => {
    c.strokeStyle = col; c.lineWidth = lw;
    c.beginPath();
    if (p.sit === 'chair') { c.moveTo(0, hipY); c.lineTo(70, hipY); c.lineTo(70 + Math.sin(ang) * 10, 0); }
    else if (p.sit === 'floor') { c.moveTo(0, hipY); c.lineTo(80, hipY - 40); c.lineTo(150, hipY + 5); }
    else { c.moveTo(0, hipY); const kx = Math.sin(ang) * 75, ky = hipY + Math.cos(ang) * 75; c.lineTo(kx, ky); c.lineTo(kx + Math.sin(ang * 0.6) * 75, ky + 75); }
    c.stroke();
    // shoe
    c.fillStyle = '#2a2220';
    let sx, sy;
    if (p.sit === 'chair') { sx = 70 + Math.sin(ang) * 10; sy = 0; }
    else if (p.sit === 'floor') { sx = 150; sy = hipY + 5; }
    else { sx = Math.sin(ang) * 75 + Math.sin(ang * 0.6) * 75; sy = hipY + Math.cos(ang) * 75 + 75; }
    c.beginPath(); c.ellipse(sx + 12, sy + 2, 24, 13, 0, 0, Math.PI * 2); c.fill();
  };
  const la = moving ? Math.sin(walk) * 0.45 : 0;
  if (p.type !== 'g') { drawLeg(-la, shade(pants, -0.25)); }
  // back arm
  const shY = hipY - 140;
  const drawArm = (ang, col, len = 125, bend = 0.25) => {
    c.strokeStyle = col; c.lineWidth = 26;
    c.beginPath(); c.moveTo(0, shY + 8);
    const ex = Math.sin(ang) * len * 0.55, ey = shY + 8 + Math.cos(ang) * len * 0.55;
    c.lineTo(ex, ey);
    const a2 = ang + bend;
    const hx = ex + Math.sin(a2) * len * 0.5, hy = ey + Math.cos(a2) * len * 0.5;
    c.lineTo(hx, hy); c.stroke();
    c.fillStyle = SKIN; c.beginPath(); c.arc(hx, hy, 14, 0, Math.PI * 2); c.fill();
    return [hx, hy];
  };
  const armSw = moving ? Math.sin(walk) * 0.5 : 0;
  const hb = drawArm(p.armB !== undefined ? p.armB : armSw, shade(top, -0.25), 125, p.bendB !== undefined ? p.bendB : 0.25);
  // body
  if (p.type !== 'g') drawLeg(la, pants);
  c.fillStyle = top;
  if (p.type === 'f') {
    c.beginPath(); c.moveTo(-48, shY); c.lineTo(48, shY); c.lineTo(62, hipY + 20); c.lineTo(-62, hipY + 20); c.closePath(); c.fill();
    rr(c, -48, shY - 8, 96, 60, 30); c.fill();
  } else if (p.type === 'g') { // grandmother in deel
    c.beginPath(); c.moveTo(-55, shY); c.lineTo(55, shY); c.lineTo(85, 0); c.lineTo(-85, 0); c.closePath(); c.fill();
    rr(c, -55, shY - 8, 110, 60, 30); c.fill();
    c.fillStyle = '#e9b949'; c.fillRect(-58, hipY - 10, 116, 18); // бүс
    c.strokeStyle = '#e9b949'; c.lineWidth = 6; c.beginPath(); c.moveTo(-10, shY - 5); c.quadraticCurveTo(20, shY + 30, 30, shY + 70); c.stroke();
  } else {
    rr(c, -52, shY - 8, 104, hipY - shY + 28, 28); c.fill();
  }
  // neck
  c.fillStyle = SKIN2; c.fillRect(-12, shY - 25, 24, 22);
  // head
  c.save(); c.translate(6, shY - 72); c.rotate(p.headTilt || 0);
  const R = 58;
  if (p.type === 'f') { c.fillStyle = '#1d1612'; rr(c, -66, -60, 128, 150, 50); c.fill(); }
  if (p.type === 'g') { c.fillStyle = '#9aa0a8'; rr(c, -62, -50, 120, 110, 45); c.fill(); }
  c.fillStyle = SKIN; c.beginPath(); c.arc(0, 0, R, 0, Math.PI * 2); c.fill();
  // ear
  c.fillStyle = SKIN2; c.beginPath(); c.ellipse(-50, 5, 10, 15, 0, 0, Math.PI * 2); c.fill();
  // hair
  c.fillStyle = '#1d1612';
  if (p.type === 'm') {
    c.beginPath(); c.arc(0, -6, R + 3, Math.PI * 1.02, Math.PI * 1.98); c.quadraticCurveTo(40, -40, 10, -30); c.quadraticCurveTo(-20, -20, -55, -5); c.closePath(); c.fill();
  } else if (p.type === 'f') {
    c.beginPath(); c.arc(0, -4, R + 5, Math.PI * 1.0, Math.PI * 2.0); c.quadraticCurveTo(30, -25, 5, -35); c.quadraticCurveTo(-30, -20, -63, 0); c.closePath(); c.fill();
  } else if (p.type === 'g') { // headscarf
    c.fillStyle = '#b8473a'; c.beginPath(); c.arc(0, -4, R + 6, Math.PI * 0.95, Math.PI * 2.05); c.closePath(); c.fill();
    c.fillStyle = '#9aa0a8'; c.beginPath(); c.arc(0, -8, R - 4, Math.PI * 1.15, Math.PI * 1.85); c.lineTo(30, -20); c.lineTo(-30, -20); c.closePath(); c.fill();
    c.fillStyle = '#b8473a'; c.fillRect(-60, -30, 120, 14);
  }
  if (p.hat) { c.fillStyle = p.hat; c.beginPath(); c.arc(0, -10, R + 6, Math.PI, Math.PI * 2); c.closePath(); c.fill(); c.fillRect(-64, -22, 128, 18); c.beginPath(); c.arc(0, -72, 14, 0, Math.PI * 2); c.fill(); }
  // face
  const ex1 = 4, ex2 = 36, ey = 2;
  const bl = p.blink || 0;
  c.fillStyle = '#2a1d18';
  const eye = (x) => {
    if (p.eyesClosed || bl > 0.5) { c.strokeStyle = '#2a1d18'; c.lineWidth = 4; c.beginPath(); c.arc(x, ey - 2, 8, 0.15 * Math.PI, 0.85 * Math.PI); c.stroke(); }
    else { c.beginPath(); c.ellipse(x, ey, 6.5, 8.5, 0, 0, Math.PI * 2); c.fill(); c.fillStyle = '#fff'; c.beginPath(); c.arc(x + 2, ey - 3, 2.2, 0, 7); c.fill(); c.fillStyle = '#2a1d18'; }
  };
  eye(ex1); eye(ex2);
  if (p.tired) { c.strokeStyle = 'rgba(110,80,120,.55)'; c.lineWidth = 3; [ex1, ex2].forEach(x => { c.beginPath(); c.arc(x, ey + 6, 9, 0.2 * Math.PI, 0.8 * Math.PI); c.stroke(); }); }
  // brows
  c.strokeStyle = '#1d1612'; c.lineWidth = 4.5;
  if (p.brow === 'angry') { c.beginPath(); c.moveTo(ex1 - 10, ey - 22); c.lineTo(ex1 + 9, ey - 14); c.moveTo(ex2 + 10, ey - 22); c.lineTo(ex2 - 9, ey - 14); c.stroke(); }
  else if (p.brow === 'sad') { c.beginPath(); c.moveTo(ex1 - 10, ey - 14); c.lineTo(ex1 + 9, ey - 21); c.moveTo(ex2 + 10, ey - 14); c.lineTo(ex2 - 9, ey - 21); c.stroke(); }
  // blush
  c.fillStyle = 'rgba(235,110,110,.35)'; c.beginPath(); c.ellipse(ex1 - 8, 24, 11, 6, 0, 0, 7); c.fill(); c.beginPath(); c.ellipse(ex2 + 8, 24, 11, 6, 0, 0, 7); c.fill();
  // mouth
  const mx = 20, my = 30; c.strokeStyle = '#6b2e2a'; c.lineWidth = 4.5; c.fillStyle = '#7a2f2b';
  const m = p.mouth || 'smile';
  c.beginPath();
  if (m === 'smile') { c.arc(mx, my - 6, 12, 0.2 * Math.PI, 0.8 * Math.PI); c.stroke(); }
  else if (m === 'grin') { c.arc(mx, my - 4, 14, 0, Math.PI); c.closePath(); c.fill(); }
  else if (m === 'open') { c.ellipse(mx, my, 9, 11, 0, 0, 7); c.fill(); }
  else if (m === 'sad') { c.arc(mx, my + 10, 11, 1.2 * Math.PI, 1.8 * Math.PI); c.stroke(); }
  else if (m === 'shout') { c.ellipse(mx, my + 2, 13, 9, 0, 0, 7); c.fill(); }
  else { c.moveTo(mx - 10, my); c.lineTo(mx + 10, my); c.stroke(); }
  if (p.tear) { c.fillStyle = 'rgba(120,180,240,.9)'; const ty = ey + 12 + p.tear * 40; c.beginPath(); c.moveTo(ex2 + 4, ty - 10); c.quadraticCurveTo(ex2 + 12, ty + 4, ex2 + 4, ty + 6); c.quadraticCurveTo(ex2 - 4, ty + 4, ex2 + 4, ty - 10); c.fill(); }
  c.restore();
  // front arm
  const hf = drawArm(p.armF !== undefined ? p.armF : -armSw, top, 125, p.bendF !== undefined ? p.bendF : 0.25);
  c.restore();
  // return hand positions in world coords
  const tw = (h) => [p.x + h[0] * s * f, p.y + (h[1] + bob) * s];
  return { hf: tw(hf), hb: tw(hb) };
}
function shade(hex, a) {
  const v = hex.match(/\w\w/g).map(h => parseInt(h, 16));
  const t = a < 0 ? 0 : 255, k = Math.abs(a);
  return 'rgb(' + v.map(x => Math.round(x + (t - x) * k)).join(',') + ')';
}
function baby(c, x, y, s = 1, ang = 0, cry = 0, sleep = false) {
  c.save(); c.translate(x, y); c.rotate(ang); c.scale(s, s);
  c.fillStyle = '#9ec9e8'; c.beginPath(); c.ellipse(0, 0, 62, 34, 0, 0, 7); c.fill();
  c.fillStyle = '#bfe0f5'; c.beginPath(); c.ellipse(-10, -4, 40, 20, 0, 0, 7); c.fill();
  c.fillStyle = SKIN; c.beginPath(); c.arc(-52, -10, 27, 0, 7); c.fill();
  c.fillStyle = '#9ec9e8'; c.beginPath(); c.arc(-56, -14, 30, Math.PI * 0.6, Math.PI * 1.6); c.fill();
  c.strokeStyle = '#2a1d18'; c.lineWidth = 3;
  if (sleep || cry > 0.1) { c.beginPath(); c.arc(-50, -14, 5, 0.1 * Math.PI, 0.9 * Math.PI); c.stroke(); c.beginPath(); c.arc(-36, -14, 5, 0.1 * Math.PI, 0.9 * Math.PI); c.stroke(); }
  else { c.fillStyle = '#2a1d18'; c.beginPath(); c.arc(-50, -12, 3.5, 0, 7); c.arc(-36, -12, 3.5, 0, 7); c.fill(); }
  c.fillStyle = '#7a2f2b';
  if (cry > 0.1) { c.beginPath(); c.ellipse(-43, 2, 7, 6 * cry + 2, 0, 0, 7); c.fill(); }
  else { c.strokeStyle = '#7a2f2b'; c.beginPath(); c.arc(-43, -2, 5, 0.2 * Math.PI, 0.8 * Math.PI); c.stroke(); }
  c.restore();
}
function toddler(c, x, y, s, walk, armsUp = 0, mouth = 'grin') {
  c.save(); c.translate(x, y); c.scale(s, s);
  c.lineCap = 'round';
  const la = Math.sin(walk) * 0.4;
  c.strokeStyle = '#4c6b8a'; c.lineWidth = 20;
  [la, -la].forEach(a => { c.beginPath(); c.moveTo(0, -70); c.lineTo(Math.sin(a) * 70, -70 + Math.cos(a) * 70); c.stroke(); });
  c.fillStyle = '#f2a541'; rr(c, -38, -150, 76, 90, 30); c.fill();
  c.strokeStyle = '#f2a541'; c.lineWidth = 18;
  const ua = lerp(0.3, 2.6, armsUp);
  [[-1, ua + Math.sin(walk) * 0.2], [1, ua - Math.sin(walk) * 0.2]].forEach(([d, a]) => { c.beginPath(); c.moveTo(0, -135); const hx = d * Math.sin(a) * 60, hy = -135 + Math.cos(a) * 60; c.lineTo(hx, hy); c.stroke(); c.fillStyle = SKIN; c.beginPath(); c.arc(hx, hy, 10, 0, 7); c.fill(); });
  c.fillStyle = SKIN; c.beginPath(); c.arc(0, -195, 50, 0, 7); c.fill();
  c.fillStyle = '#1d1612'; c.beginPath(); c.arc(0, -205, 46, Math.PI * 1.05, Math.PI * 1.95); c.quadraticCurveTo(0, -225, -45, -212); c.fill();
  c.fillStyle = '#2a1d18'; c.beginPath(); c.arc(-15, -192, 5, 0, 7); c.arc(15, -192, 5, 0, 7); c.fill();
  c.fillStyle = 'rgba(235,110,110,.4)'; c.beginPath(); c.ellipse(-28, -176, 9, 5, 0, 0, 7); c.ellipse(28, -176, 9, 5, 0, 0, 7); c.fill();
  c.fillStyle = '#7a2f2b'; c.beginPath(); c.arc(0, -175, 10, 0, Math.PI); c.fill();
  c.restore();
}

// ---------- props ----------
function bulb(c, x, y, level, swing = 0) {
  c.save(); c.translate(x, 0); c.rotate(swing);
  c.strokeStyle = '#333'; c.lineWidth = 3; c.beginPath(); c.moveTo(0, 0); c.lineTo(0, y - 20); c.stroke();
  c.fillStyle = '#555'; c.fillRect(-10, y - 30, 20, 18);
  c.fillStyle = level > 0.05 ? lerpCol('9a9a9a', 'fff4c4', level) : '#9a9a9a';
  c.beginPath(); c.arc(0, y, 22, 0, 7); c.fill();
  c.restore();
}
function glow(c, x, y, r, a, col = '255,214,140') {
  if (a <= 0) return;
  c.save(); c.globalCompositeOperation = 'lighter';
  const g = c.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, `rgba(${col},${0.55 * a})`); g.addColorStop(0.35, `rgba(${col},${0.18 * a})`); g.addColorStop(1, `rgba(${col},0)`);
  c.fillStyle = g; c.fillRect(x - r, y - r, r * 2, r * 2); c.restore();
}
function room(c, o = {}) {
  const wall = o.wall || ['f3e3c8', 'e6cfa9'];
  const g = c.createLinearGradient(0, 0, 0, 820); g.addColorStop(0, '#' + wall[0]); g.addColorStop(1, '#' + wall[1]);
  c.fillStyle = g; c.fillRect(0, 0, W, 820);
  // wallpaper dots
  c.fillStyle = 'rgba(160,120,80,.07)';
  for (let y = 40; y < 800; y += 70) for (let x = (y / 70 % 2) * 35; x < W; x += 70) { c.beginPath(); c.arc(x, y, 4, 0, 7); c.fill(); }
  c.fillStyle = o.floor || '#a87b56'; c.fillRect(0, 820, W, 260);
  c.strokeStyle = 'rgba(0,0,0,.08)'; c.lineWidth = 3;
  for (let x = -200; x < W + 200; x += 160) { c.beginPath(); c.moveTo(x, 820); c.lineTo(x - 120, 1080); c.stroke(); }
  c.fillStyle = '#7d5a3e'; c.fillRect(0, 812, W, 14);
}
function windowFrame(c, x, y, w, h, sky) {
  c.save(); rr(c, x, y, w, h, 6); c.clip(); sky(c, x, y, w, h); c.restore();
  c.strokeStyle = '#f8f4ec'; c.lineWidth = 16; rr(c, x, y, w, h, 6); c.stroke();
  c.lineWidth = 9; c.beginPath(); c.moveTo(x + w / 2, y); c.lineTo(x + w / 2, y + h); c.moveTo(x, y + h * 0.42); c.lineTo(x + w, y + h * 0.42); c.stroke();
  c.fillStyle = '#efe7d9'; c.fillRect(x - 24, y + h, w + 48, 18);
}
function skyNight(t) { return (c, x, y, w, h) => {
  const g = c.createLinearGradient(0, y, 0, y + h); g.addColorStop(0, '#0d1b3d'); g.addColorStop(1, '#2b3a6b'); c.fillStyle = g; c.fillRect(x, y, w, h);
  const r = rng(7); c.fillStyle = '#fff';
  for (let i = 0; i < 25; i++) { c.globalAlpha = 0.4 + 0.6 * Math.abs(Math.sin(t * 1.5 + i)); c.fillRect(x + r() * w, y + r() * h * 0.6, 2.5, 2.5); }
  c.globalAlpha = 1;
  c.fillStyle = '#1b2547'; for (let i = 0; i < 5; i++) { const bx = x + i * w / 5; c.fillRect(bx, y + h * 0.62 + (i % 2) * 25, w / 5 - 8, h); }
  c.fillStyle = '#ffd98a'; for (let i = 0; i < 12; i++) { const rx = r(); c.fillRect(x + rx * w, y + h * 0.7 + r() * h * 0.25, 9, 11); }
  // snow
  c.fillStyle = 'rgba(255,255,255,.85)'; const r2 = rng(3);
  for (let i = 0; i < 40; i++) { const sx = x + ((r2() * w + t * 20 * (0.5 + r2())) % w), sy = y + ((r2() * h + t * 60 * (0.6 + r2())) % h); c.beginPath(); c.arc(sx, sy, 2.5, 0, 7); c.fill(); }
}; }
function skyDay(k, t) { return (c, x, y, w, h) => { // k: 0 morning blue, 1 evening orange, 2 spring
  const top = k === 1 ? '#f28c4b' : (k === 2 ? '#7cc6f2' : '#5d7fb8'), bot = k === 1 ? '#f9d48b' : (k === 2 ? '#d9f1ff' : '#a9c1e3');
  const g = c.createLinearGradient(0, y, 0, y + h); g.addColorStop(0, top); g.addColorStop(1, bot); c.fillStyle = g; c.fillRect(x, y, w, h);
  if (k === 2) { c.fillStyle = '#fff6b0'; c.beginPath(); c.arc(x + w * 0.75, y + h * 0.25, 40, 0, 7); c.fill(); c.fillStyle = 'rgba(255,255,255,.9)'; const cx = x + ((t * 15) % (w + 200)) - 100; c.beginPath(); c.arc(cx, y + 90, 30, 0, 7); c.arc(cx + 35, y + 80, 38, 0, 7); c.arc(cx + 75, y + 92, 28, 0, 7); c.fill(); }
  c.fillStyle = k === 1 ? '#8a5a6b' : (k === 2 ? '#7fb08a' : '#6b7ea3');
  c.beginPath(); c.moveTo(x, y + h); c.lineTo(x, y + h * 0.7); c.quadraticCurveTo(x + w * 0.3, y + h * 0.45, x + w * 0.55, y + h * 0.65); c.quadraticCurveTo(x + w * 0.8, y + h * 0.5, x + w, y + h * 0.62); c.lineTo(x + w, y + h); c.fill();
}; }
function curtains(c, x, y, w, h, col = '#c8553d') {
  c.fillStyle = col;
  c.beginPath(); c.moveTo(x - 50, y - 30); c.lineTo(x + 40, y - 30); c.quadraticCurveTo(x + 10, y + h * 0.5, x + 30, y + h + 30); c.lineTo(x - 50, y + h + 30); c.fill();
  c.beginPath(); c.moveTo(x + w + 50, y - 30); c.lineTo(x + w - 40, y - 30); c.quadraticCurveTo(x + w - 10, y + h * 0.5, x + w - 30, y + h + 30); c.lineTo(x + w + 50, y + h + 30); c.fill();
  c.fillStyle = '#6e4a32'; c.fillRect(x - 70, y - 44, w + 140, 14);
}
function clock(c, x, y, hours, r = 55) {
  c.fillStyle = '#fffdf6'; c.strokeStyle = '#5b4636'; c.lineWidth = 7; c.beginPath(); c.arc(x, y, r, 0, 7); c.fill(); c.stroke();
  c.fillStyle = '#5b4636'; for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; c.beginPath(); c.arc(x + Math.sin(a) * r * 0.78, y - Math.cos(a) * r * 0.78, 3, 0, 7); c.fill(); }
  const ha = (hours % 12) / 12 * Math.PI * 2, ma = (hours % 1) * Math.PI * 2;
  c.lineCap = 'round'; c.lineWidth = 6; c.beginPath(); c.moveTo(x, y); c.lineTo(x + Math.sin(ha) * r * 0.45, y - Math.cos(ha) * r * 0.45); c.stroke();
  c.lineWidth = 4; c.beginPath(); c.moveTo(x, y); c.lineTo(x + Math.sin(ma) * r * 0.7, y - Math.cos(ma) * r * 0.7); c.stroke();
}
function box(c, x, y, w, h, col = '#c89a62') {
  c.fillStyle = col; c.fillRect(x - w / 2, y - h, w, h);
  c.fillStyle = shade(col.replace('#', '#'), -0.15); c.fillRect(x - w / 2, y - h, w, 14);
  c.fillStyle = 'rgba(255,255,255,.35)'; c.fillRect(x - 12, y - h, 24, h);
}
function plant(c, x, y, s, t) {
  c.save(); c.translate(x, y); c.scale(s, s);
  c.fillStyle = '#c0603e'; c.beginPath(); c.moveTo(-30, -50); c.lineTo(30, -50); c.lineTo(22, 0); c.lineTo(-22, 0); c.fill();
  c.fillStyle = '#4f9d5d';
  for (let i = 0; i < 5; i++) { const a = -1 + i * 0.5 + Math.sin(t * 1.2 + i) * 0.05; c.save(); c.translate(0, -50); c.rotate(a); c.beginPath(); c.ellipse(0, -45, 14, 45, 0, 0, 7); c.fill(); c.restore(); }
  c.restore();
}
function table(c, x, y, w = 420) {
  c.fillStyle = '#8b5e3c'; c.fillRect(x - w / 2, y - 210, w, 26);
  c.fillStyle = '#6e472b'; c.fillRect(x - w / 2 + 20, y - 190, 22, 190); c.fillRect(x + w / 2 - 42, y - 190, 22, 190);
}
function chair(c, x, y, f = 1) {
  c.save(); c.translate(x, y); c.scale(f, 1);
  c.fillStyle = '#7a4f31'; c.fillRect(-60, -125, 120, 18); c.fillRect(-55, -110, 14, 110); c.fillRect(42, -110, 14, 110); c.fillRect(-62, -300, 16, 190);
  c.restore();
}
function sofa(c, x, y, col = '#5c7aa3') {
  c.fillStyle = shade(col, -0.2); rr(c, x - 330, y - 330, 660, 200, 40); c.fill();
  c.fillStyle = col; rr(c, x - 320, y - 170, 640, 120, 30); c.fill();
  rr(c, x - 380, y - 230, 90, 200, 35); c.fill(); rr(c, x + 290, y - 230, 90, 200, 35); c.fill();
  c.fillStyle = '#3c2a1e'; c.fillRect(x - 300, y - 50, 18, 50); c.fillRect(x + 282, y - 50, 18, 50);
}
function crib(c, x, y) {
  c.strokeStyle = '#e8d6bd'; c.fillStyle = '#e8d6bd'; c.lineWidth = 10;
  c.fillRect(x - 160, y - 150, 320, 18); c.fillRect(x - 170, y - 280, 18, 280); c.fillRect(x + 152, y - 280, 18, 280);
  c.lineWidth = 7; for (let i = -130; i <= 130; i += 32) { c.beginPath(); c.moveTo(x + i, y - 270); c.lineTo(x + i, y - 140); c.stroke(); }
  c.fillRect(x - 170, y - 280, 340, 14);
}
function heart(c, x, y, s, col = '#e8505b', a = 1) {
  c.save(); c.globalAlpha = a; c.translate(x, y); c.scale(s, s); c.fillStyle = col;
  c.beginPath(); c.moveTo(0, 8); c.bezierCurveTo(-20, -8, -10, -22, 0, -12); c.bezierCurveTo(10, -22, 20, -8, 0, 8); c.fill(); c.restore();
}
function bubble(c, x, y, text, o = {}) {
  c.save();
  const fs = o.size || 46; c.font = `${fs}px FiraB`;
  const tw = c.measureText(text).width + 60, th = fs + 44;
  const a = o.alpha === undefined ? 1 : o.alpha; c.globalAlpha = a;
  const sc = 0.7 + 0.3 * Math.min(1, a * 1.5);
  c.translate(x, y); c.scale(sc, sc);
  c.fillStyle = o.bg || '#fff'; c.strokeStyle = o.stroke || '#2a2a2a'; c.lineWidth = 5;
  if (o.jag) {
    c.beginPath(); const n = 22;
    for (let i = 0; i <= n; i++) { const an = i / n * Math.PI * 2, rx = tw / 2 + (i % 2 ? 22 : 0), ry = th / 2 + (i % 2 ? 22 : 0); const px = Math.cos(an) * rx, py = Math.sin(an) * ry; i ? c.lineTo(px, py) : c.moveTo(px, py); }
    c.closePath(); c.fill(); c.stroke();
  } else {
    rr(c, -tw / 2, -th / 2, tw, th, th / 2); c.fill(); c.stroke();
    const tx = o.tail || 0; c.beginPath(); c.moveTo(tx - 18, th / 2 - 3); c.lineTo(tx + (o.tailDir || -1) * 30, th / 2 + 36); c.lineTo(tx + 18, th / 2 - 3); c.fill();
    c.beginPath(); c.moveTo(tx - 18, th / 2); c.lineTo(tx + (o.tailDir || -1) * 30, th / 2 + 36); c.lineTo(tx + 18, th / 2); c.stroke();
  }
  c.fillStyle = o.color || '#222'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(text, 0, 3);
  c.restore();
}
function zzz(c, x, y, t) {
  c.save(); c.font = '40px FiraB'; c.fillStyle = '#e8eefc';
  for (let i = 0; i < 3; i++) { const k = ((t * 0.5 + i / 3) % 1); c.globalAlpha = Math.sin(k * Math.PI); c.fillText('z', x + k * 50, y - k * 90); }
  c.restore();
}
function tint(c, col, a, mode = 'multiply') { if (a <= 0) return; c.save(); c.globalCompositeOperation = mode; c.globalAlpha = a; c.fillStyle = col; c.fillRect(0, 0, W, H); c.restore(); }
function vignette(c, a = 0.45) {
  const g = c.createRadialGradient(W / 2, H / 2, H * 0.35, W / 2, H / 2, H * 0.95);
  g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, `rgba(0,0,0,${a})`); c.fillStyle = g; c.fillRect(0, 0, W, H);
}

// ---------- city ----------
const CITY = (() => {
  const r = rng(42), b = [];
  let x = -100;
  while (x < W + 100) { const w = 140 + r() * 160, h = 260 + r() * 330; const win = []; for (let yy = 30; yy < h - 40; yy += 52) for (let xx = 22; xx < w - 30; xx += 46) win.push([xx, yy, r()]); b.push({ x, w, h, win, depth: 0 }); x += w + 12 + r() * 20; }
  return b;
})();
const HERO = { x: 960, y: 540 }; // hero window centre (on hero building)
function city(c, t, zoom, lit, cozy) {
  const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#07112b'); g.addColorStop(0.7, '#1f2d5c'); g.addColorStop(1, '#3a3f6e'); c.fillStyle = g; c.fillRect(0, 0, W, H);
  const r = rng(11); c.fillStyle = '#fff';
  for (let i = 0; i < 160; i++) { c.globalAlpha = 0.3 + 0.7 * Math.abs(Math.sin(t * 0.9 + i * 1.7)); c.fillRect(r() * W, r() * H * 0.55, 2.2, 2.2); }
  c.globalAlpha = 1;
  // moon
  c.fillStyle = '#fdf3d0'; c.beginPath(); c.arc(1700, 110, 50, 0, 7); c.fill(); glow(c, 1700, 110, 260, 0.6, '230,230,255');
  c.save();
  c.translate(HERO.x, HERO.y); c.scale(zoom, zoom); c.translate(-HERO.x, -HERO.y);
  // mountains (Богд хан уул)
  c.fillStyle = '#18224a'; c.beginPath(); c.moveTo(-400, 760); c.quadraticCurveTo(300, 420, 800, 640); c.quadraticCurveTo(1200, 470, 1600, 600); c.quadraticCurveTo(2000, 480, 2400, 760); c.fill();
  // far buildings
  CITY.forEach((bd, i) => {
    const by = 1000 - bd.h;
    c.fillStyle = '#2a3566'; c.fillRect(bd.x, by, bd.w, bd.h + 100);
    bd.win.forEach(([wx, wy, k]) => { const on = k < lit; c.fillStyle = on ? (k < lit * 0.5 ? '#ffd27a' : '#f5b85c') : '#1a2248'; c.fillRect(bd.x + wx, by + wy, 26, 32); });
    // chimney smoke
    if (i % 3 === 0) { for (let s = 0; s < 6; s++) { const k = ((t * 0.12 + s / 6) % 1); c.fillStyle = `rgba(150,150,170,${0.18 * (1 - k)})`; c.beginPath(); c.arc(bd.x + bd.w * 0.5 + k * 80, by - 20 - k * 200, 20 + k * 50, 0, 7); c.fill(); } }
  });
  // hero building in front
  const hb = { x: 760, w: 400, top: 330 };
  c.fillStyle = '#39457a'; c.fillRect(hb.x, hb.top, hb.w, 800);
  c.fillStyle = '#2c3768'; c.fillRect(hb.x - 10, hb.top - 14, hb.w + 20, 18);
  const rw = rng(5);
  for (let yy = hb.top + 30; yy < 1080; yy += 70) for (let xx = hb.x + 30; xx < hb.x + hb.w - 40; xx += 70) {
    const isHero = Math.abs(xx + 21 - HERO.x) < 40 && Math.abs(yy + 25 - HERO.y) < 40;
    const k = rw();
    if (isHero) continue;
    c.fillStyle = k < lit ? '#ffcf73' : '#1c2550'; c.fillRect(xx, yy, 42, 50);
  }
  // hero window
  const hx = HERO.x - 24, hy = HERO.y - 28;
  c.fillStyle = lerpCol('1c2550', 'ffe39a', cozy); c.fillRect(hx, hy, 48, 56);
  c.strokeStyle = '#555f8f'; c.lineWidth = 3; c.strokeRect(hx, hy, 48, 56); c.beginPath(); c.moveTo(HERO.x, hy); c.lineTo(HERO.x, hy + 56); c.stroke();
  if (cozy > 0.3) { // silhouettes inside
    c.fillStyle = `rgba(90,60,40,${(cozy - 0.3)})`; c.beginPath(); c.arc(HERO.x - 10, HERO.y + 6, 6, 0, 7); c.arc(HERO.x + 10, HERO.y + 6, 6, 0, 7); c.fill(); c.fillRect(HERO.x - 16, HERO.y + 12, 12, 16); c.fillRect(HERO.x + 4, HERO.y + 12, 12, 16);
  }
  c.restore();
  glow(c, HERO.x, HERO.y, 120 * zoom, cozy * 0.9);
  // ground snow
  c.fillStyle = '#c9d3ec'; c.fillRect(0, 1040, W, 40);
  // falling snow
  const rs = rng(9); c.fillStyle = 'rgba(255,255,255,.9)';
  for (let i = 0; i < 180; i++) { const sp = 0.5 + rs(); const sx = (rs() * W + Math.sin(t * 0.8 + i) * 30 + t * 25) % W; const sy = (rs() * H + t * 70 * sp) % H; c.beginPath(); c.arc(sx, sy, 1.5 + sp * 1.5, 0, 7); c.fill(); }
}
function titleText(c, text, sub, a, y = 300) {
  if (a <= 0) return;
  c.save(); c.globalAlpha = a; c.textAlign = 'center'; c.textBaseline = 'middle';
  c.shadowColor = 'rgba(255,200,120,.7)'; c.shadowBlur = 40;
  c.font = '800 130px Mont'; c.fillStyle = '#fff3d6'; c.fillText(text, W / 2, y + (1 - a) * 20);
  c.shadowBlur = 0;
  if (sub) { c.font = '500 40px Mont'; c.fillStyle = 'rgba(255,243,214,.85)'; c.fillText(sub, W / 2, y + 100); }
  c.restore();
}

// ---------- scenes ----------
const T = n => (n);
function blinkAt(t, seed = 0) { const k = (t + seed) % 3.7; return k < 0.12 ? 1 : 0; }

const OLD = [
  { d: 9, f: (c, t) => { // title
    city(c, t, lerp(1.0, 1.25, ease(t / 9)), 0.18, prog(t, 2.5, 5));
    titleText(c, 'ЖИЖИГХЭН ГЭРЭЛ', 'та нарын сонголтоор үргэлжлэх түүх', prog(t, 3, 5) * (1 - prog(t, 7.6, 8.8)), 230);
  } },
  { d: 15, f: (c, t) => { // move-in
    room(c, { wall: ['ece6dc', 'd6cbb8'] });
    windowFrame(c, 1250, 230, 380, 330, skyNight(t));
    const lit = prog(t, 2.2, 3.2);
    // empty walls get a bit warm when light goes on
    bulb(c, 960, 250, lit, Math.sin(t * 1.3) * 0.02);
    // door
    c.fillStyle = '#8a6446'; c.fillRect(120, 380, 220, 440); c.fillStyle = '#d8b04a'; c.beginPath(); c.arc(310, 610, 10, 0, 7); c.fill();
    // Temuulen walks in with big box
    const tx = lerp(230, 760, prog(t, 0.2, 3.6)); const tWalk = t < 3.6 ? t * 7 : undefined;
    const placed = t > 4.2;
    const tm = person(c, { x: tx, y: 900, s: 1.05, type: 'm', top: '#3d6b8f', pants: '#2b3044', walk: tWalk, armF: placed ? 0.2 : 1.35, armB: placed ? -0.1 : 1.2, bendF: placed ? 0.25 : 0.1, bendB: placed ? 0.25 : 0.1, hat: t < 6 ? '#b23a3a' : null, mouth: t > 8.5 ? 'grin' : 'smile', blink: blinkAt(t), face: t > 9 ? 1 : 1 });
    if (!placed) box(c, tx + 105, 900 - 175, 170, 130);
    else box(c, 820, 905, 170, 130);
    // Nomin with plant + small box
    const nx = lerp(160, 1060, prog(t, 1.4, 5.6)); const nWalk = t > 1.4 && t < 5.6 ? t * 7 : undefined;
    const nPlaced = t > 6.2;
    if (t > 1.2) {
      person(c, { x: nx, y: 905, s: 1.0, type: 'f', top: '#d97b66', pants: '#4b3b47', walk: nWalk, armF: nPlaced ? (t > 9 ? 0.6 : 0.15) : 1.2, armB: nPlaced ? 0 : 1.1, bendF: nPlaced ? 0.4 : 0.2, mouth: t > 8.5 ? 'grin' : 'smile', blink: blinkAt(t, 1.3), face: t > 7 ? -1 : 1 });
      if (!nPlaced) { box(c, nx + 95, 905 - 170, 110, 90, '#d3a873'); plant(c, nx + 95, 905 - 258, 0.7, t); }
      else { box(c, 1170, 905, 110, 90, '#d3a873'); plant(c, 1470, 555, 0.8, t); }
    }
    // hearts
    if (t > 9) for (let i = 0; i < 6; i++) { const k = ((t - 9) * 0.35 + i / 6) % 1; heart(c, 900 + Math.sin(i * 2 + t) * 120, 520 - k * 260, 1.6 + i % 3 * 0.4, '#e8505b', Math.sin(k * Math.PI) * prog(t, 9, 10)); }
    glow(c, 960, 250, 900, lit);
    tint(c, '#1d2a55', 0.5 * (1 - lit));
    vignette(c);
  } },
  { d: 18, f: (c, t) => { // routine
    const k = t < 6 ? 0 : (t < 11 ? 1 : 2);
    room(c, { wall: ['f3e3c8', 'e6cfa9'] });
    const sky = k === 0 ? skyDay(0, t) : (k === 1 ? skyDay(1, t) : skyNight(t));
    windowFrame(c, 1250, 230, 380, 330, sky); curtains(c, 1250, 230, 380, 330);
    plant(c, 1470, 555, 0.8, t);
    // clock spinning
    const hrs = k === 0 ? 6.5 + t * 0.4 : (k === 1 ? 9 + (t - 6) * 1.8 : 19 + (t - 11) * 0.05);
    clock(c, 560, 220, hrs);
    bulb(c, 960, 200, k === 2 ? 1 : 0.2);
    table(c, 960, 905, 520);
    if (k === 0) {
      // Temuulen puts on hat and leaves left; door
      c.fillStyle = '#8a6446'; c.fillRect(120, 380, 220, 440);
      const leave = prog(t, 2.5, 5.5);
      person(c, { x: lerp(600, 80, leave), y: 905, s: 1.05, type: 'm', top: '#2f4f6f', pants: '#2b3044', walk: t > 2.5 ? t * 7 : undefined, face: t > 2.5 ? -1 : 1, hat: '#b23a3a', armF: t < 2.5 ? lerp(0, 2.8, Math.abs(Math.sin(t * 4)) * 0.6 + 0.2) : undefined, mouth: 'smile', blink: blinkAt(t) });
      person(c, { x: 1150, y: 905, s: 1.0, type: 'f', top: '#d97b66', pants: '#4b3b47', face: -1, armF: 2.4 + Math.sin(t * 6) * 0.3, bendF: 0.2, mouth: 'smile', blink: blinkAt(t, 2) });
    } else if (k === 1) {
      chair(c, 1000, 905, 1);
      person(c, { x: 990, y: 905, s: 1.0, type: 'f', top: '#d97b66', pants: '#4b3b47', sit: 'chair', face: -1, armF: 1.45 + Math.sin(t * 18) * 0.06, armB: 1.4 + Math.cos(t * 17) * 0.06, bendF: 0.2, bendB: 0.2, mouth: 'flat', blink: blinkAt(t, 0.7), tired: t > 9 });
      table(c, 960, 905, 520);
      // laptop
      c.fillStyle = '#3b3f4a'; c.beginPath(); c.moveTo(800, 695); c.lineTo(760, 590); c.lineTo(880, 590); c.lineTo(900, 695); c.fill(); c.fillStyle = '#8fd3ff'; c.globalAlpha = .6; c.beginPath(); c.moveTo(812, 685); c.lineTo(775, 600); c.lineTo(870, 600); c.lineTo(888, 685); c.fill(); c.globalAlpha = 1;
      c.fillStyle = '#555a66'; c.fillRect(780, 693, 170, 10);
      glow(c, 830, 640, 200, 0.4, '150,210,255');
    } else {
      chair(c, 760, 905, -1); chair(c, 1160, 905, 1);
      const laugh = Math.max(0, Math.sin((t - 11) * 9)) * (t > 13.5 && t < 16 ? 1 : 0);
      person(c, { x: 790, y: 905 - laugh * 6, s: 1.05, type: 'm', top: '#3d6b8f', pants: '#2b3044', sit: 'chair', face: 1, armF: 1.3 + Math.sin(t * 3) * 0.15, bendF: -0.5, mouth: t > 13.5 ? 'grin' : 'smile', blink: blinkAt(t), eyesClosed: laugh > 0.3 });
      person(c, { x: 1130, y: 905 - laugh * 6, s: 1.0, type: 'f', top: '#d97b66', pants: '#4b3b47', sit: 'chair', face: -1, armF: 1.2 + Math.cos(t * 3) * 0.15, bendF: -0.5, mouth: t > 13.5 ? 'grin' : 'smile', blink: blinkAt(t, 1.5), eyesClosed: laugh > 0.3 });
      table(c, 960, 905, 520);
      // bowls with steam (цуйван)
      [880, 1040].forEach((bx, i) => { c.fillStyle = '#f7f3ea'; c.beginPath(); c.ellipse(bx, 690, 60, 14, 0, 0, 7); c.fill(); c.beginPath(); c.moveTo(bx - 60, 690); c.quadraticCurveTo(bx, 750, bx + 60, 690); c.fill(); c.fillStyle = '#c98b4a'; c.beginPath(); c.ellipse(bx, 688, 50, 9, 0, 0, 7); c.fill();
        c.strokeStyle = 'rgba(255,255,255,.6)'; c.lineWidth = 5; for (let s = 0; s < 3; s++) { const ph = t * 2 + s * 2 + i; c.beginPath(); c.moveTo(bx - 20 + s * 20, 670); c.bezierCurveTo(bx - 35 + s * 20 + Math.sin(ph) * 10, 640, bx - 5 + s * 20 + Math.cos(ph) * 10, 610, bx - 20 + s * 20, 580); c.stroke(); } });
      glow(c, 960, 200, 900, 1);
    }
    if (k === 0) tint(c, '#5b6fa6', 0.25);
    if (k === 1) tint(c, '#f2a65a', 0.12, 'soft-light');
    vignette(c);
  } },
  { d: 13, f: (c, t) => { // the news
    room(c, { wall: ['f6e1cf', 'e9c9ad'] });
    windowFrame(c, 1350, 230, 360, 320, skyNight(t)); curtains(c, 1350, 230, 360, 320);
    bulb(c, 700, 200, 1);
    // picture frame
    c.fillStyle = '#6e4a32'; c.fillRect(380, 280, 200, 150); c.fillStyle = '#f2e4c9'; c.fillRect(395, 295, 170, 120); heart(c, 480, 360, 2.2);
    sofa(c, 860, 905);
    const reveal = prog(t, 4.5, 5.3);
    const jump = t > 8 ? Math.abs(Math.sin((t - 8) * 6)) * (t < 10.5 ? 1 : 0) : 0;
    const hug = prog(t, 10.5, 11.8);
    // Temuulen sitting -> jumps -> hugs
    const tStand = t > 7.6;
    if (!tStand) person(c, { x: 640, y: 900, s: 1.05, type: 'm', top: '#3d6b8f', pants: '#2b3044', sit: 'chair', mouth: t > 6 ? 'open' : 'smile', blink: blinkAt(t), armF: 0.9, bendF: -0.4 });
    else person(c, { x: lerp(720, 900, hug), y: 905 - jump * 110, s: 1.05, type: 'm', top: '#3d6b8f', pants: '#2b3044', mouth: 'grin', armF: lerp(2.8, 1.6, hug), armB: lerp(2.7, 1.5, hug), bendF: 0.1, bendB: 0.1, eyesClosed: jump > 0.5 || hug > 0.5 });
    // Nomin standing
    const shoes = person(c, { x: lerp(1180, 1080, hug), y: 905, s: 1.0, type: 'f', top: '#e0a14f', pants: '#4b3b47', face: -1, armF: lerp(-0.5, 1.35, reveal), armB: hug > 0 ? 1.4 * hug : -0.4, bendF: 0.1, mouth: t > 5 ? 'grin' : 'smile', blink: blinkAt(t, 2), eyesClosed: hug > 0.5 });
    if (reveal > 0 && hug < 0.6) { // baby shoes in hand
      const [hx, hy] = shoes.hf; const sc = 1 + 0.15 * Math.sin(t * 5) * (t < 8 ? 1 : 0);
      c.save(); c.translate(hx, hy - 10); c.scale(sc, sc); c.globalAlpha = reveal;
      c.fillStyle = '#f7a7b8'; [-20, 18].forEach(dx => { c.beginPath(); c.ellipse(dx, 0, 16, 26, 0, 0, 7); c.fill(); c.fillStyle = '#fff'; c.beginPath(); c.ellipse(dx, -8, 9, 10, 0, 0, 7); c.fill(); c.fillStyle = '#f7a7b8'; });
      c.restore();
      glow(c, hx, hy, 160, reveal * 0.8, '255,220,230');
    }
    if (t > 6 && t < 7.8) bubble(c, 640, 380, '?!', { alpha: prog(t, 6, 6.3), size: 60 });
    if (t > 8) for (let i = 0; i < 14; i++) { const k = ((t - 8) * 0.4 + i / 14) % 1; heart(c, 990 + Math.sin(i * 3.1) * 380 * k, 560 - k * 420, 1.4 + (i % 3) * 0.6, i % 2 ? '#e8505b' : '#f7a7b8', Math.sin(k * Math.PI)); }
    glow(c, 700, 200, 900, 1);
    vignette(c);
  } },
  { d: 18, f: (c, t) => { // baby nights
    room(c, { wall: ['d9d4e6', 'bdb6d1'], floor: '#8a6f63' });
    windowFrame(c, 1350, 230, 360, 320, skyNight(t)); curtains(c, 1350, 230, 360, 320, '#6b5a8e');
    clock(c, 560, 220, t < 6 ? 2 + t * 0.12 : (t < 12 ? 3 + (t - 6) * 0.05 : 4.2 + (t - 12) * 0.08));
    crib(c, 1120, 905);
    // Nomin rocking baby, pacing
    const pace = Math.sin(t * 0.8);
    const handOff = prog(t, 11, 12.5);
    chair(c, 420, 905, -1);
    // Temuulen: sleeping on chair (nodding) then gets up and takes baby
    const tUp = t > 10.5;
    const tx = tUp ? lerp(450, 760, prog(t, 10.5, 12)) : 450;
    const tm = person(c, { x: tx, y: 905, s: 1.05, type: 'm', top: '#55657f', pants: '#2b3044', sit: tUp ? null : 'chair', walk: tUp && t < 12 ? t * 6 : undefined, headTilt: tUp ? 0 : 0.25 + Math.sin(t * 1.5) * 0.08, eyesClosed: !tUp, mouth: tUp ? 'flat' : 'open', tired: true, armF: t > 12 ? 1.5 : (tUp ? undefined : 0.6), armB: t > 12 ? 1.4 : undefined, bendF: t > 12 ? 0.9 : 0.3, bendB: t > 12 ? 0.9 : 0.25 });
    if (!tUp) zzz(c, 520, 520, t);
    const nx = t < 11 ? 860 + pace * 140 : lerp(900, 1000, prog(t, 12.5, 14));
    const nm = person(c, { x: nx, y: 905, s: 1.0, type: 'f', top: '#8f6fa8', pants: '#4b3b47', face: t < 11 ? (Math.cos(t * 0.8) > 0 ? 1 : -1) : -1, armF: t < 12.5 ? 1.5 : 0.1, armB: t < 12.5 ? 1.4 : 0, bendF: t < 12.5 ? 0.9 : 0.3, bendB: 0.9, tired: true, mouth: 'flat', blink: blinkAt(t, 1), headTilt: t > 14 ? 0.15 : 0, eyesClosed: t > 15 });
    const cry = t < 9.5 ? Math.abs(Math.sin(t * 5)) : (t > 12.5 ? 0 : 0.6);
    let bx, by;
    if (t < 12) { bx = nm.hf[0] + 10; by = nm.hf[1] + 45; } else { bx = tm.hf[0] - 20; by = tm.hf[1] + 85; }
    baby(c, bx, by + Math.sin(t * 4) * 6, 1, Math.sin(t * 4) * 0.08, cry, t > 14);
    if (t < 9.5 && Math.sin(t * 2.2) > -0.2) bubble(c, bx - 40, by - 160, 'Уаа! Уаа!', { alpha: 1, size: 40, jag: true, bg: '#fff3f3' });
    if (t > 15) zzz(c, bx + 10, by - 60, t);
    bulb(c, 900, 160, 0.15);
    tint(c, '#283a7a', 0.45);
    glow(c, 1530, 390, 500, 0.35, '170,190,255');
    vignette(c, 0.6);
  } },
  { d: 19, f: (c, t) => { // argument
    room(c, { wall: ['efd6c2', 'dcb79d'] });
    windowFrame(c, 1400, 230, 340, 320, skyNight(t)); curtains(c, 1400, 230, 340, 320);
    clock(c, 560, 220, 23.6 + t * 0.01);
    bulb(c, 960, 200, 1);
    table(c, 960, 905, 460);
    // bills
    const rb = rng(21);
    for (let i = 0; i < 7; i++) { c.save(); c.translate(860 + rb() * 200, 690); c.rotate((rb() - 0.5) * 0.5); c.fillStyle = '#fbfbf7'; c.fillRect(-55, -14, 110, 16); c.restore(); }
    c.save(); c.translate(980, 676); c.rotate(-0.08); c.fillStyle = '#fff'; c.fillRect(-70, -20, 140, 26); c.fillStyle = '#c0392b'; c.font = '18px FiraB'; c.textAlign = 'center'; c.fillText('ТӨЛБӨР', 0, -1); c.restore();
    const enter = prog(t, 0.5, 4);
    // Temuulen walks in from left (late, tired)
    const fight = t > 4.8 && t < 12;
    const leave = prog(t, 12.6, 16);
    const tx = t < 12.6 ? lerp(-80, 640, enter) : lerp(640, 2150, leave);
    person(c, { x: tx, y: 905, s: 1.05, type: 'm', top: '#2f4f6f', pants: '#2b3044', walk: (t < 4 || t > 12.6) ? t * 6.5 : undefined, face: t > 12.4 ? 1 : 1, hat: t < 6 ? '#b23a3a' : null, tired: true, mouth: t > 8.6 && t < 12 ? 'shout' : 'sad', brow: t > 8.6 && t < 12.4 ? 'angry' : 'sad', armF: t > 8.6 && t < 12 ? 1.9 + Math.sin(t * 8) * 0.2 : undefined, bendF: 0.3, blink: blinkAt(t) });
    // Nomin
    const nAngry = t > 4.8 && t < 12.4;
    const nSit = t > 13.5;
    if (nSit) chair(c, 1250, 905, 1);
    person(c, { x: nSit ? 1230 : 1200, y: 905, s: 1.0, type: 'f', top: '#8f6fa8', pants: '#4b3b47', face: nSit ? 1 : -1, sit: nSit ? 'chair' : null, mouth: nAngry ? (t < 8.4 ? 'shout' : 'sad') : 'sad', brow: nAngry ? 'angry' : 'sad', armF: nAngry && t < 8.4 ? 2.2 + Math.sin(t * 9) * 0.25 : (nSit ? 2.6 : 0.3), bendF: nSit ? 1.4 : 0.3, armB: nSit ? 2.5 : 0, bendB: nSit ? 1.4 : 0.25, tired: true, tear: nSit ? ((t - 13.5) * 0.4) % 1 : 0, headTilt: nSit ? 0.35 : 0, eyesClosed: nSit, blink: blinkAt(t, 1.1) });
    if (t > 5.1 && t < 8.4) bubble(c, 1150, 330, (window.ARG_N || 'Яагаад дахиад оройтов?!'), { alpha: prog(t, 5.1, 5.4), size: 44, jag: true, bg: '#fff0ec' });
    if (t > 8.6 && t < 11.8) bubble(c, 640, 330, (window.ARG_T || 'Би ч бас ядарч байна!'), { alpha: prog(t, 8.6, 8.9), size: 44, jag: true, bg: '#eef3ff' });
    // shake during fight
    tint(c, '#b4473b', fight ? 0.22 : 0.12, 'multiply');
    glow(c, 960, 200, 800, 0.7);
    if (t > 14) tint(c, '#2b3a6b', prog(t, 14, 18.5) * 0.4);
    vignette(c, 0.55);
  } },
  { d: 22, f: (c, t) => { // blackout + candle
    // base room night
    room(c, { wall: ['efd6c2', 'dcb79d'] });
    windowFrame(c, 1400, 230, 340, 320, (cc, x, y, w, h) => { cc.fillStyle = '#0b1530'; cc.fillRect(x, y, w, h); const r = rng(4); cc.fillStyle = '#fff'; for (let i = 0; i < 30; i++) cc.fillRect(x + r() * w, y + r() * h, 2.5, 2.5); cc.fillStyle = '#121a3a'; cc.fillRect(x, y + h * 0.6, w, h); });
    curtains(c, 1400, 230, 340, 320);
    const off1 = window.BO_DARK || t > 0.8;
    bulb(c, 960, 200, off1 ? 0 : 1);
    // Nomin on floor, with baby
    const AL = !!window.BO_ALONE;
    const lean = AL ? 0 : prog(t, 13.5, 15.5);
    const tIn = prog(t, 4.5, 8.5);
    const tx = lerp(2050, 860, tIn);
    const tSit = t > 9.6;
    const nm = person(c, { x: 1060 - lean * 10, y: 905, s: 1.0, type: 'f', top: '#8f6fa8', pants: '#4b3b47', sit: 'floor', face: -1, armF: 1.0, armB: 0.9, bendF: 0.6, bendB: 0.6, headTilt: lerp(0.15, -0.38, lean), mouth: (!AL && t > 15) ? 'smile' : 'sad', brow: (AL || t < 12) ? 'sad' : null, eyesClosed: !AL && t > 16, tear: AL ? ((t * 0.35) % 1) * (t > 6 ? 1 : 0) : (t > 11.5 && t < 13 ? (t - 11.5) / 1.5 : 0) });
    const cry = t > 1.2 && t < 9.5 ? Math.abs(Math.sin(t * 5)) : 0;
    const tm = AL ? { hf: [900, 905] } : person(c, { x: tSit ? 860 : tx, y: 905, s: 1.05, type: 'm', top: '#2f4f6f', pants: '#2b3044', sit: tSit ? 'floor' : null, walk: t > 4.5 && t < 8.5 ? t * 5 : undefined, face: tSit ? 1 : -1, armF: tSit ? lerp(0.9, 1.9, lean) : 1.4, bendF: tSit ? lerp(-0.6, 0.8, lean) : -1.2, mouth: t > 15 ? 'smile' : 'sad', brow: 'sad', headTilt: tSit ? lean * 0.1 : 0, eyesClosed: t > 16.5 });
    baby(c, 1000, 790, 0.85, 0.05, cry, t > 12);
    // candle
    let cx, cy;
    if (AL) { cx = 880; cy = 865; } else if (!tSit) { cx = tm.hf[0]; cy = tm.hf[1] - 40; } else { cx = lerp(tm.hf[0], 740, prog(t, 9.6, 10.6)); cy = lerp(tm.hf[1] - 40, 865, prog(t, 9.6, 10.6)); }
    if (AL) { c.fillStyle = '#1b1b22'; rr(c, 1170, 880, 70, 22, 6); c.fill(); }
    if (t > 4) {
      c.fillStyle = '#7a5a3a'; c.beginPath(); c.ellipse(cx, cy + 40, 34, 9, 0, 0, 7); c.fill();
      c.fillStyle = '#f5efe0'; c.fillRect(cx - 12, cy - 30, 24, 70);
      const fl = 1 + Math.sin(t * 23) * 0.08 + Math.sin(t * 37) * 0.05;
      c.fillStyle = '#ffcf5c'; c.beginPath(); c.ellipse(cx, cy - 46, 9 * fl, 20 * fl, 0, 0, 7); c.fill();
      c.fillStyle = '#fff7d6'; c.beginPath(); c.ellipse(cx, cy - 42, 4, 9, 0, 0, 7); c.fill();
    }
    if (cry > 0.2 && t < 9) bubble(c, 1010, 640, 'Уаа!', { size: 40, jag: true, bg: '#fff3f3' });
    if (!AL && t > 8 && t < 10.5) bubble(c, 820, 470, 'Уучлаарай...', { alpha: prog(t, 8, 8.3), size: 44, tailDir: 1 });
    if (!AL && t > 11 && t < 13.5) bubble(c, 1120, 520, 'Би ч бас...', { alpha: prog(t, 11, 11.3), size: 44 });
    // darkness with candle hole
    octx.clearRect(0, 0, W, H);
    const dark = off1 ? (t < 4 ? 0.94 : 0.9) : 0;
    octx.globalCompositeOperation = 'source-over'; octx.fillStyle = `rgba(4,6,18,${dark})`; octx.fillRect(0, 0, W, H);
    if (t > 4) {
      const fl = 1 + Math.sin(t * 17) * 0.03; const rad = lerp(150, 520, prog(t, 4, 6)) * fl;
      octx.globalCompositeOperation = 'destination-out';
      const g = octx.createRadialGradient(cx, cy - 40, 0, cx, cy - 40, rad); g.addColorStop(0, 'rgba(0,0,0,1)'); g.addColorStop(0.55, 'rgba(0,0,0,.75)'); g.addColorStop(1, 'rgba(0,0,0,0)');
      octx.fillStyle = g; octx.fillRect(0, 0, W, H);
      octx.globalCompositeOperation = 'source-over';
    }
    // window moonlight
    if (off1) { octx.globalCompositeOperation = 'destination-out'; octx.fillStyle = 'rgba(0,0,0,.45)'; octx.fillRect(1400, 230, 340, 320); octx.globalCompositeOperation = 'source-over'; }
    c.drawImage(off, 0, 0);
    if (t > 4) { glow(c, cx, cy - 46, 380, 0.75); tint(c, '#ff9f43', 0.08, 'soft-light'); }
    if (AL) { const pulse = 0.6 + 0.4 * Math.abs(Math.sin(t * 3)); c.fillStyle = `rgba(150,200,255,${pulse})`; rr(c, 1174, 883, 62, 16, 4); c.fill(); glow(c, 1205, 885, 140, pulse * 0.6, '150,200,255'); if (t > 7) { c.save(); c.font = '30px FiraB'; c.fillStyle = `rgba(220,235,255,${prog(t, 7, 8)})`; c.textAlign = 'center'; c.fillText('Тэмүүлэн', 1205, 850); c.restore(); } }
    if (!AL && t > 15) for (let i = 0; i < 5; i++) { const k = ((t - 15) * 0.3 + i / 5) % 1; heart(c, 960 + Math.sin(i * 2.3) * 100, 520 - k * 220, 1.2, '#f28b82', Math.sin(k * Math.PI) * 0.8 * prog(t, 15, 16)); }
    if (!off1) glow(c, 960, 200, 800, 0.7);
    vignette(c, 0.5);
  } },
  { d: 17, f: (c, t) => { // grandma call — split
    // left: ger interior
    c.save(); c.beginPath(); c.rect(0, 0, 960, H); c.clip();
    const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#f4dcb0'); g.addColorStop(1, '#e2b884'); c.fillStyle = g; c.fillRect(0, 0, 960, H);
    // хана lattice
    c.strokeStyle = '#b0703c'; c.lineWidth = 6;
    for (let x = -400; x < 1200; x += 50) { c.beginPath(); c.moveTo(x, 420); c.lineTo(x + 300, 820); c.stroke(); c.beginPath(); c.moveTo(x + 300, 420); c.lineTo(x, 820); c.stroke(); }
    c.fillStyle = '#c2482f'; c.fillRect(0, 400, 960, 24);
    // уни roof poles
    c.strokeStyle = '#d0502f'; c.lineWidth = 12;
    for (let i = -6; i <= 6; i++) { c.beginPath(); c.moveTo(480, -120); c.lineTo(480 + i * 120, 400); c.stroke(); }
    c.fillStyle = '#e9b949'; c.beginPath(); c.arc(480, -60, 120, 0, 7); c.fill();
    // stove
    c.fillStyle = '#3a3a3a'; c.fillRect(380, 640, 200, 180); c.fillRect(460, 250, 26, 390); c.fillStyle = '#ff8a3d'; c.globalAlpha = 0.5 + 0.3 * Math.sin(t * 8); c.fillRect(410, 700, 60, 40); c.globalAlpha = 1;
    glow(c, 440, 720, 260, 0.7);
    // floor carpet
    c.fillStyle = '#a33b2c'; c.fillRect(0, 820, 960, 260); c.strokeStyle = '#e9b949'; c.lineWidth = 6; c.strokeRect(40, 850, 880, 200);
    // painted chest
    c.fillStyle = '#e46b3c'; c.fillRect(640, 640, 240, 180); c.strokeStyle = '#ffd15c'; c.lineWidth = 5; c.strokeRect(655, 655, 210, 150);
    const gm = person(c, { x: 230, y: 905, s: 1.0, type: 'g', top: '#3f7d8c', sit: 'chair', face: 1, armF: 0.4, armB: 2.6, bendB: 1.7, mouth: (t > 5 && t < 13 && Math.sin(t * 9) > 0) ? 'open' : 'smile', blink: blinkAt(t, 0.4) });
    c.fillStyle = '#dfe6f0'; c.strokeStyle = '#333'; c.lineWidth = 3; rr(c, 230 - 44 - 14, 905 - 120 - 140 - 72 - 30, 22, 50, 6); c.fill(); c.stroke();
    c.restore();
    // right: apartment
    c.save(); c.beginPath(); c.rect(960, 0, 960, H); c.clip(); c.translate(960, 0);
    const g2 = c.createLinearGradient(0, 0, 0, 820); g2.addColorStop(0, '#f6e7d6'); g2.addColorStop(1, '#ead0b4'); c.fillStyle = g2; c.fillRect(0, 0, 960, 820);
    c.fillStyle = '#a87b56'; c.fillRect(0, 820, 960, 260); c.fillStyle = '#7d5a3e'; c.fillRect(0, 812, 960, 14);
    windowFrame(c, 520, 200, 340, 320, skyDay(0, t)); curtains(c, 520, 200, 340, 320);
    plant(c, 760, 525, 0.8, t);
    const nm = person(c, { x: 330, y: 905, s: 1.0, type: 'f', top: '#e0a14f', pants: '#4b3b47', face: -1, armF: 0.3, armB: 2.6, bendB: 1.7, mouth: t > 13 ? 'grin' : (t < 3.5 && Math.sin(t * 9) > 0 ? 'open' : 'smile'), brow: t < 6 ? 'sad' : null, blink: blinkAt(t, 2.2), eyesClosed: t > 13.5 });
    c.fillStyle = '#dfe6f0'; c.strokeStyle = '#333'; c.lineWidth = 3; rr(c, 330 + 44 - 8, 905 - 150 - 140 - 72 - 30, 22, 50, 6); c.fill(); c.stroke();
    c.restore();
    // divider
    c.fillStyle = '#fff'; c.fillRect(955, 0, 10, H);
    // phone signal waves
    for (let i = 0; i < 3; i++) { const k = ((t * 0.8 + i / 3) % 1); c.strokeStyle = `rgba(255,255,255,${(1 - k) * 0.8})`; c.lineWidth = 5; c.beginPath(); c.arc(960, 420, 30 + k * 80, -0.6, 0.6); c.stroke(); c.beginPath(); c.arc(960, 420, 30 + k * 80, Math.PI - 0.6, Math.PI + 0.6); c.stroke(); }
    vignette(c, 0.4);
  } },
  { d: 19, f: (c, t) => { // spring — first steps
    room(c, { wall: ['fbf0d9', 'f1dcb6'], floor: '#b98a60' });
    windowFrame(c, 1300, 200, 400, 360, skyDay(2, t)); curtains(c, 1300, 200, 400, 360, '#e9a13b');
    plant(c, 1530, 565, 1.25, t);
    // flowers on plant
    [[1500, 360], [1560, 330], [1600, 380]].forEach(([fx, fy], i) => { c.fillStyle = '#f26b8a'; for (let p = 0; p < 5; p++) { const a = p / 5 * 7 + t * 0.3; c.beginPath(); c.arc(fx + Math.cos(a) * 10, fy + Math.sin(a) * 10, 8, 0, 7); c.fill(); } c.fillStyle = '#ffd34d'; c.beginPath(); c.arc(fx, fy, 6, 0, 7); c.fill(); });
    // sunlight beam
    c.save(); c.globalCompositeOperation = 'lighter'; c.fillStyle = 'rgba(255,240,190,.12)'; c.beginPath(); c.moveTo(1300, 200); c.lineTo(1700, 200); c.lineTo(1200, 1080); c.lineTo(600, 1080); c.fill(); c.restore();
    // photo frames on wall
    c.fillStyle = '#6e4a32'; c.fillRect(380, 260, 180, 140); c.fillStyle = '#f2e4c9'; c.fillRect(392, 272, 156, 116); heart(c, 470, 335, 2);
    c.fillStyle = '#6e4a32'; c.fillRect(600, 300, 140, 110); c.fillStyle = '#d9ecf5'; c.fillRect(610, 310, 120, 90);
    // Nomin kneeling right, toddler walks from her to Temuulen (left)
    const w = prog(t, 7.2, 12.5);
    const caught = t > 12.5;
    const lift = prog(t, 13, 14.5);
    const tox = lerp(1080, 720, w);
    // Temuulen kneeling (floor-sit) arms open
    const tm = person(c, { x: 560, y: 905, s: 1.05, type: 'm', top: '#4f8a6b', pants: '#2b3044', sit: lift > 0 ? null : 'floor', face: 1, armF: caught ? lerp(1.4, 2.6, lift) : 1.9 + Math.sin(t * 2) * 0.1, armB: caught ? lerp(1.3, 2.5, lift) : 1.6, bendF: 0.1, bendB: 0.1, mouth: t > 8 ? 'grin' : 'smile', blink: blinkAt(t), eyesClosed: lift > 0.6 });
    if (!caught) toddler(c, tox, 905, 0.9 + 0.05, t > 7.2 ? t * 6 : 0, t > 7.2 ? 0.6 : 0.3);
    else { const hx = lerp(700, 640, lift), hy = lerp(905, 905 - 320, lift) + Math.sin(t * 6) * 8 * lift; toddler(c, hx, hy, 0.9, 0, lerp(0.6, 1, lift)); }
    person(c, { x: 1240, y: 905, s: 1.0, type: 'f', top: '#e0a14f', pants: '#4b3b47', sit: 'floor', face: -1, armF: t > 12.5 ? 2.4 + Math.abs(Math.sin(t * 8)) * 0.5 : (t < 7.2 ? 1.5 : 1.2), armB: t > 12.5 ? 2.3 + Math.abs(Math.cos(t * 8)) * 0.5 : 1.2, bendF: 0.4, bendB: 0.4, mouth: 'grin', blink: blinkAt(t, 1.6), eyesClosed: t > 13 && t < 15 });
    if (t > 12.6 && t < 15.5) bubble(c, 700, 300, 'Аав аа!', { alpha: prog(t, 12.6, 12.9), size: 54, tailDir: -1 });
    if (t > 14.5) for (let i = 0; i < 10; i++) { const k = ((t - 14.5) * 0.35 + i / 10) % 1; heart(c, 640 + Math.sin(i * 2.7) * 300 * k, 520 - k * 380, 1.4 + (i % 3) * 0.5, i % 2 ? '#e8505b' : '#ffb347', Math.sin(k * Math.PI)); }
    tint(c, '#ffd27a', 0.1, 'soft-light');
    vignette(c, 0.35);
  } },
  { d: 15, f: (c, t) => { // ending
    city(c, t + 3, lerp(1.6, 1.0, ease(t / 7)), lerp(0.25, 0.85, prog(t, 1, 9)), 1);
    if (t > 11) { c.fillStyle = `rgba(0,0,0,${prog(t, 11, 12.2) * 0.55})`; c.fillRect(0, 0, W, H); }
    titleText(c, 'ТӨГСГӨЛ', '«Жижигхэн гэрэл»', prog(t, 11.4, 12.6), 470);
  } },
];
const OLD_SUBS = [
  [9.6, 15.8, 'Тэмүүлэн, Номин хоёр хуримаа хийгээд анхны түрээсийн байрандаа орж ирлээ.'],
  [16.4, 23.5, 'Хоёр хайрцаг юм, ганц чийдэн... бас хоёр зүрх.'],
  [24.6, 31.4, 'Цалин бага, өвөл урт. Тэмүүлэн өглөө эрт гарч, орой оройтож ирнэ.'],
  [32.0, 41.5, 'Гэхдээ орой бүр нэг ширээнд суугаад хамт хооллох нь тэдэнд хангалттай байлаа.'],
  [42.6, 47.0, 'Нэгэн орой Номин нуусан юмаа гаргаж ирэв...'],
  [47.4, 50.2, 'Жижигхэн хос гутал.'],
  [50.5, 54.6, '— Бид... аав ээж болох нь уу?!'],
  [55.6, 61.0, 'Хүү нь мэндэлж, нэрийг нь Тэнгис гэж өглөө.'],
  [61.5, 67.6, 'Түүнээс хойш шөнө гэж байсангүй. Нэг нь унтахад нөгөө нь сэрүүн.'],
  [68.2, 72.6, 'Ядаргаа өдөр бүр бага багаар хуримтлагдана.'],
  [73.5, 77.8, 'Нэгэн шөнө ширээн дээр төлбөрийн хуудаснууд овоорсон байв.'],
  [85.6, 91.6, 'Ядарсан үед үг хурц болдог. Тэр шөнө тэд дахин ярьсангүй.'],
  [92.5, 96.6, 'Гэнэт бүхэл бүтэн байшингийн гэрэл тасарлаа.'],
  [96.9, 99.8, 'Харанхуйд Тэнгис уйлж эхлэв.'],
  [106.4, 113.6, 'Гэрэлгүй тэр шөнө тэд бие биедээ хамгийн ойрхон байсан юм.'],
  [114.5, 118.6, 'Маргааш нь Номин эмээ рүүгээ залгав.'],
  [119.0, 123.2, '— Гэр бүл гэдэг хоёр хүн бие биеэ буруутгах биш,'],
  [123.4, 127.8, 'нэг зүг рүү хамтдаа харахыг хэлдэг юм, миний охин.'],
  [128.0, 130.6, 'Номин инээмсэглэв.'],
  [131.6, 137.4, 'Хавар ирлээ. Цонхон дээрх цэцэг ургаж, Тэнгис ч томорчээ.'],
  [138.0, 142.8, 'Тэгээд нэгэн өдөр... тэр анхны алхмаа хийлээ.'],
  [147.0, 149.8, 'Аавынхаа тэврэлт рүү.'],
  [150.8, 155.4, 'Гэр бүл гэдэг том байшин биш.'],
  [155.8, 161.0, 'Хамтдаа асааж, хамтдаа хамгаалдаг жижигхэн гэрэл юм.'],
];
