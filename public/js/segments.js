// Интерактив хувилбарын дүр зургууд (engine.js-ийн туслах функцууд дээр суурилна)

// ---------- шинэ туслах зургууд ----------
function car(c, x, y, s, o = {}) {
  c.save(); c.translate(x, y); c.scale(s * (o.face || 1), s);
  // shadow
  c.fillStyle = 'rgba(0,0,0,.25)'; c.beginPath(); c.ellipse(0, 4, 180, 14, 0, 0, 7); c.fill();
  // cabin
  c.fillStyle = o.color || '#e3e5ea';
  c.beginPath(); c.moveTo(-110, -70); c.lineTo(-62, -132); c.lineTo(72, -132); c.lineTo(118, -70); c.closePath(); c.fill();
  c.fillStyle = '#2b3a5a';
  c.beginPath(); c.moveTo(-92, -74); c.lineTo(-56, -122); c.lineTo(0, -122); c.lineTo(0, -74); c.closePath(); c.fill();
  c.beginPath(); c.moveTo(10, -74); c.lineTo(10, -122); c.lineTo(66, -122); c.lineTo(100, -74); c.closePath(); c.fill();
  // driver
  if (o.driver) {
    c.save(); c.beginPath(); c.moveTo(10, -74); c.lineTo(10, -122); c.lineTo(66, -122); c.lineTo(100, -74); c.closePath(); c.clip();
    c.fillStyle = SKIN; c.beginPath(); c.arc(50, -88, 20, 0, 7); c.fill();
    c.fillStyle = '#b23a3a'; c.beginPath(); c.arc(50, -94, 21, Math.PI, 0); c.fill();
    c.restore();
  }
  if (o.passenger) {
    c.save(); c.beginPath(); c.moveTo(-92, -74); c.lineTo(-56, -122); c.lineTo(0, -122); c.lineTo(0, -74); c.closePath(); c.clip();
    c.fillStyle = '#c99a7a'; c.beginPath(); c.arc(-40, -88, 19, 0, 7); c.fill(); c.fillStyle = '#3a2a22'; c.beginPath(); c.arc(-40, -94, 20, Math.PI, 0); c.fill();
    c.restore();
  }
  // body
  c.fillStyle = o.color || '#e3e5ea'; rr(c, -170, -78, 340, 62, 22); c.fill();
  c.fillStyle = 'rgba(0,0,0,.12)'; c.fillRect(-160, -40, 320, 6);
  c.fillStyle = '#ffe9a8'; rr(c, 150, -66, 20, 14, 5); c.fill();
  c.fillStyle = '#e04848'; rr(c, -170, -66, 14, 14, 4); c.fill();
  // wheels
  [-100, 100].forEach(wx => {
    c.fillStyle = '#222'; c.beginPath(); c.arc(wx, -14, 30, 0, 7); c.fill();
    c.fillStyle = '#9aa0aa'; c.beginPath(); c.arc(wx, -14, 13, 0, 7); c.fill();
    c.strokeStyle = '#555'; c.lineWidth = 3; const a = o.wheel || 0;
    for (let k = 0; k < 3; k++) { const aa = a + k * 2.094; c.beginPath(); c.moveTo(wx + Math.cos(aa) * 4, -14 + Math.sin(aa) * 4); c.lineTo(wx + Math.cos(aa) * 12, -14 + Math.sin(aa) * 12); c.stroke(); }
  });
  // taxi sign
  if (o.taxi > 0) {
    c.save(); c.translate(5, -132); c.scale(o.taxi, o.taxi);
    c.fillStyle = '#f5c518'; rr(c, -42, -28, 84, 28, 6); c.fill();
    c.fillStyle = '#222'; c.font = '20px FiraB'; c.textAlign = 'center'; c.fillText('TAXI', 0, -7);
    c.restore();
  }
  c.restore();
  if (o.lights) glow(c, x + 175 * s * (o.face || 1), y - 58 * s, 260 * s, 0.6, '255,235,170');
}
function streetBg(c, t, scroll) {
  const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#0a1430'); g.addColorStop(1, '#27325e'); c.fillStyle = g; c.fillRect(0, 0, W, H);
  const r0 = rng(17); c.fillStyle = '#fff'; for (let i = 0; i < 80; i++) { c.globalAlpha = 0.3 + 0.6 * Math.abs(Math.sin(t + i)); c.fillRect(r0() * W, r0() * 380, 2, 2); } c.globalAlpha = 1;
  // far buildings (parallax)
  const span = 2600; const r = rng(23);
  for (let i = 0; i < 16; i++) {
    const bw = 140 + r() * 120, bh = 260 + r() * 300, bx0 = i * 165;
    let bx = ((bx0 - scroll * 0.35) % span + span) % span - 300;
    c.fillStyle = '#26315f'; c.fillRect(bx, 800 - bh, bw, bh);
    for (let yy = 800 - bh + 24; yy < 780; yy += 46) for (let xx = 16; xx < bw - 24; xx += 40) { const k = r(); c.fillStyle = k < 0.35 ? '#ffcf73' : '#1b2350'; c.fillRect(bx + xx, yy, 20, 26); }
  }
  // sidewalk + road
  c.fillStyle = '#4a4f63'; c.fillRect(0, 790, W, 40);
  c.fillStyle = '#2f3240'; c.fillRect(0, 830, W, 250);
  c.fillStyle = '#d8d3b0'; for (let i = -1; i < 12; i++) { const dx = ((i * 220 - scroll) % 2420 + 2420) % 2420 - 220; c.fillRect(dx, 975, 120, 10); }
  // street lights
  for (let i = -1; i < 6; i++) {
    const lx = ((i * 520 - scroll * 0.9) % 3120 + 3120) % 3120 - 400;
    c.fillStyle = '#1c1f2a'; c.fillRect(lx, 470, 10, 330); c.fillRect(lx, 470, 70, 8);
    c.fillStyle = '#ffe7a6'; c.beginPath(); c.ellipse(lx + 66, 482, 18, 8, 0, 0, 7); c.fill();
    glow(c, lx + 66, 520, 240, 0.5, '255,220,150');
  }
  // light snow
  const rs = rng(9); c.fillStyle = 'rgba(255,255,255,.8)';
  for (let i = 0; i < 90; i++) { const sp = 0.5 + rs(); const sx = ((rs() * W - scroll * 0.6 + t * 20) % W + W) % W; const sy = (rs() * H + t * 60 * sp) % H; c.beginPath(); c.arc(sx, sy, 1.5 + sp, 0, 7); c.fill(); }
}
function phoneCard(c, x, y, title, msg, a, o = {}) {
  if (a <= 0) return;
  c.save(); c.globalAlpha = a; c.translate(x, y); const sc = 0.85 + 0.15 * a; c.scale(sc, sc);
  c.fillStyle = '#16181f'; rr(c, -190, -300, 380, 600, 44); c.fill();
  c.fillStyle = o.bg || '#eef1f7'; rr(c, -172, -270, 344, 545, 30); c.fill();
  c.fillStyle = '#16181f'; rr(c, -50, -288, 100, 16, 8); c.fill();
  c.fillStyle = '#2d3142'; c.font = '30px FiraB'; c.textAlign = 'center'; c.fillText(title, 0, -200);
  if (o.call) {
    const p = 1 + 0.08 * Math.sin(o.t * 10);
    c.fillStyle = '#d97b66'; c.beginPath(); c.arc(0, -60, 70 * p, 0, 7); c.fill(); c.fillStyle = '#fff'; c.font = '60px FiraB'; c.fillText(title[0], 0, -38);
    c.fillStyle = '#555'; c.font = '26px Fira'; c.fillText(msg, 0, 60);
    c.fillStyle = '#3fb36b'; c.beginPath(); c.arc(80, 190, 40, 0, 7); c.fill(); c.fillStyle = '#e05252'; c.beginPath(); c.arc(-80, 190, 40, 0, 7); c.fill();
  } else if (o.type) {
    c.textAlign = 'left'; c.fillStyle = '#fff'; rr(c, -150, 140, 300, 70, 16); c.fill();
    c.fillStyle = '#2d3142'; c.font = '28px Fira'; const shown = msg.slice(0, Math.floor(o.type)); c.fillText(shown + ((Math.floor(o.t * 2) % 2) ? '|' : ''), -132, 185);
  } else {
    c.textAlign = 'left'; c.fillStyle = '#ffffff'; rr(c, -150, -140, 300, 120, 24); c.fill();
    c.fillStyle = '#2d3142'; c.font = '26px Fira';
    wrap(c, msg, 260).forEach((l, i) => c.fillText(l, -130, -98 + i * 34));
    heart(c, 112, -40, 1.3);
  }
  c.restore();
}
function noteCard(c, text, sign, a) {
  if (a <= 0) return;
  c.save(); c.globalAlpha = a; c.fillStyle = 'rgba(0,0,0,.45)'; c.fillRect(0, 0, W, H);
  c.translate(W / 2, 470); c.rotate(-0.03);
  c.fillStyle = '#fbf6ea'; c.fillRect(-420, -230, 840, 460);
  c.strokeStyle = 'rgba(80,120,200,.25)'; c.lineWidth = 2; for (let y = -150; y < 220; y += 56) { c.beginPath(); c.moveTo(-380, y); c.lineTo(380, y); c.stroke(); }
  c.fillStyle = '#2d3142'; c.font = 'italic 48px Fira'; c.textAlign = 'center';
  wrap(c, text, 680).forEach((l, i) => c.fillText(l, 0, -90 + i * 66));
  c.font = 'italic 40px Fira'; c.textAlign = 'right'; c.fillText(sign, 360, 170);
  c.restore();
}
function ger(c, x, y, s, o = {}) {
  c.save(); c.translate(x, y); c.scale(s, s);
  c.fillStyle = 'rgba(0,0,0,.15)'; c.beginPath(); c.ellipse(0, 4, 190, 18, 0, 0, 7); c.fill();
  c.fillStyle = o.night ? '#b9b8c6' : '#f4f1ea'; c.fillRect(-160, -120, 320, 120);
  c.fillStyle = o.night ? '#a9a8b8' : '#e6e0d2'; c.beginPath(); c.moveTo(-172, -118); c.lineTo(0, -205); c.lineTo(172, -118); c.closePath(); c.fill();
  c.strokeStyle = '#8b5e3c'; c.lineWidth = 5; [-120, -60].forEach(yy => { c.beginPath(); c.moveTo(-160, yy + 30); c.lineTo(160, yy + 30); c.stroke(); });
  c.beginPath(); c.moveTo(-170, -118); c.lineTo(170, -118); c.stroke();
  // door
  c.fillStyle = '#e46b3c'; c.fillRect(-34, -100, 68, 100); c.strokeStyle = '#ffd15c'; c.lineWidth = 4; c.strokeRect(-26, -92, 52, 84);
  if (o.doorLit) { c.fillStyle = `rgba(255,214,120,${o.doorLit})`; c.fillRect(-26, -92, 52, 84); }
  // toono
  c.fillStyle = '#c2482f'; c.beginPath(); c.ellipse(0, -200, 28, 9, 0, 0, 7); c.fill();
  // chimney + smoke
  c.fillStyle = '#555'; c.fillRect(46, -235, 12, 70);
  const t = o.t || 0;
  for (let i = 0; i < 6; i++) { const k = (t * 0.15 + i / 6) % 1; c.fillStyle = `rgba(230,230,240,${0.35 * (1 - k)})`; c.beginPath(); c.arc(52 + k * 90 + Math.sin(k * 6 + i) * 10, -245 - k * 220, 14 + k * 40, 0, 7); c.fill(); }
  c.restore();
  if (o.doorLit) glow(c, x, y - 50 * s, 260 * s, o.doorLit);
  if (o.toonoLit) glow(c, x, y - 205 * s, 200 * s, o.toonoLit);
}
function sheep(c, x, y, s, ph) {
  c.save(); c.translate(x, y + Math.abs(Math.sin(ph)) * -4); c.scale(s, s);
  c.strokeStyle = '#3a3030'; c.lineWidth = 6; c.lineCap = 'round';
  [-25, -10, 12, 26].forEach((lx, i) => { c.beginPath(); c.moveTo(lx, -10); c.lineTo(lx + Math.sin(ph + i) * 5, 18); c.stroke(); });
  c.fillStyle = '#f7f5ef'; [[-28, -22, 20], [-6, -30, 24], [18, -24, 21], [0, -12, 24], [-22, -10, 18], [22, -10, 18]].forEach(([a, b, r]) => { c.beginPath(); c.arc(a, b, r, 0, 7); c.fill(); });
  c.fillStyle = '#3a3030'; c.beginPath(); c.ellipse(42, -26, 12, 16, -0.4, 0, 7); c.fill();
  c.restore();
}
function steppeBg(c, t, scroll, k) { // k: 0 day, 1 sunset, 2 night
  const top = k < 1 ? lerpCol('6fb6ea', 'e9805a', k) : lerpCol('e9805a', '0c1634', k - 1);
  const bot = k < 1 ? lerpCol('d5efff', 'f8d08a', k) : lerpCol('f8d08a', '2a3566', k - 1);
  const g = c.createLinearGradient(0, 0, 0, 760); g.addColorStop(0, top); g.addColorStop(1, bot); c.fillStyle = g; c.fillRect(0, 0, W, H);
  if (k > 1.2) { const r = rng(5); c.fillStyle = '#fff'; for (let i = 0; i < 160; i++) { c.globalAlpha = (k - 1.2) * (0.4 + 0.6 * Math.abs(Math.sin(t + i))); c.fillRect(r() * W, r() * 600, 2.2, 2.2); } c.globalAlpha = 1; }
  if (k < 1.3) { const sy = lerp(160, 700, clamp(k / 1.3)); c.fillStyle = k < 0.5 ? '#fff6c0' : '#ffd27a'; c.beginPath(); c.arc(1500, sy, 60, 0, 7); c.fill(); glow(c, 1500, sy, 300, 0.6, '255,230,160'); }
  const dk = clamp(k / 2) * 0.7;
  const hill = (col, base, amp, freq, par) => { c.fillStyle = lerpCol(col, '141a33', dk); c.beginPath(); c.moveTo(0, H); for (let x = 0; x <= W; x += 20) c.lineTo(x, base + Math.sin((x + scroll * par) * freq) * amp + Math.sin((x + scroll * par) * freq * 2.3) * amp * 0.4); c.lineTo(W, H); c.fill(); };
  hill('8aa3c4', 620, 60, 0.004, 0.1);
  hill('7fae6b', 720, 40, 0.006, 0.3);
  hill('97c16f', 800, 25, 0.008, 0.6);
}
function argRoom(c, t, o = {}) {
  room(c, { wall: o.day ? ['f6e7d6', 'ead0b4'] : ['efd6c2', 'dcb79d'] });
  windowFrame(c, 1400, 230, 340, 320, o.day ? skyDay(o.sky || 0, t) : skyNight(t)); curtains(c, 1400, 230, 340, 320);
  if (o.plant) plant(c, 1620, 555, 0.8, t);
  if (o.clock !== undefined) clock(c, 560, 220, o.clock);
  bulb(c, 960, 200, o.light === undefined ? 1 : o.light);
  // door
  c.fillStyle = '#8a6446'; c.fillRect(120, 380, 220, 440); c.fillStyle = '#d8b04a'; c.beginPath(); c.arc(310, 610, 10, 0, 7); c.fill();
  if (o.doorOpen) { c.fillStyle = '#1a1410'; c.fillRect(120, 380, 220 * o.doorOpen, 440); }
}
function bills(c) {
  const rb = rng(21);
  for (let i = 0; i < 7; i++) { c.save(); c.translate(860 + rb() * 200, 690); c.rotate((rb() - 0.5) * 0.5); c.fillStyle = '#fbfbf7'; c.fillRect(-55, -14, 110, 16); c.restore(); }
  c.save(); c.translate(980, 676); c.rotate(-0.08); c.fillStyle = '#fff'; c.fillRect(-70, -20, 140, 26); c.fillStyle = '#c0392b'; c.font = '18px FiraB'; c.textAlign = 'center'; c.fillText('ТӨЛБӨР', 0, -1); c.restore();
}
function laptop(c, x, y, f = 1, col = '150,210,255') {
  c.save(); c.translate(x, y); c.scale(f, 1);
  c.fillStyle = '#3b3f4a'; c.beginPath(); c.moveTo(-30, 0); c.lineTo(-70, -105); c.lineTo(50, -105); c.lineTo(70, 0); c.fill();
  c.fillStyle = '#8fd3ff'; c.globalAlpha = .6; c.beginPath(); c.moveTo(-18, -10); c.lineTo(-55, -95); c.lineTo(40, -95); c.lineTo(58, -10); c.fill(); c.globalAlpha = 1;
  c.fillStyle = '#555a66'; c.fillRect(-50, -2, 170, 10);
  c.restore(); glow(c, x, y - 50, 200, 0.4, col);
}
function cam(c, cx, cy, z) { c.translate(cx, cy); c.scale(z, z); c.translate(-cx, -cy); }

// ---------- дүр зургууд ----------
const T1 = '#3d6b8f', N1 = '#d97b66';
const SEG = {
  title: { d: 9, music: 'warm', f: (c, t) => OLD[0].f(c, t), subs: [] },
  movein: { d: 15, music: 'warm', f: (c, t) => { OLD[1].f(c, t); if (t > 10.2 && t < 13.5) bubble(c, 760, 330, 'Жижигхэн ч гэсэн манайх шүү.', { alpha: prog(t, 10.2, 10.5), size: 42 }); },
    subs: [[0.6, 6.8, 'Тэмүүлэн, Номин хоёр саяхан гэрлээд, анхныхаа түрээсийн байранд нүүж орлоо.'], [7.2, 10, 'Хоёрхон хайрцаг ачаа, ганц чийдэн... тэгээд бие биедээ хайртай хоёр хүн.']] },
  routine: { d: 18, music: 'warm', f: (c, t) => OLD[2].f(c, t),
    subs: [[0.6, 7.4, 'Цалин бага, өвөл хүйтэн. Тэмүүлэн өглөө эрт гараад, орой хожуу ирдэг.'], [8, 17.5, 'Гэсэн ч орой бүр хамтдаа хоол идэх нь тэдний хувьд аз жаргал байлаа.']] },
  news: { d: 13, music: 'warm', f: (c, t) => OLD[3].f(c, t),
    subs: [[0.6, 5, 'Нэг орой Номин ард нь нуусан зүйлээ гаргаж ирлээ...'], [5.4, 8.2, 'Хүүхдийн жижигхэн гутал.'], [8.5, 12.6, 'Тэмүүлэн: Хүлээгээрэй... бид аав ээж болох гэж байна уу?!']] },
  baby: { d: 18, music: 'soft', f: (c, t) => OLD[4].f(c, t),
    subs: [[0.6, 6, 'Удалгүй хүү нь төрж, нэрийг нь Тэнгис гэж өглөө.'], [6.5, 12.6, 'Тэр цагаас хойш тэд шөнөжин бараг унтаж чаддаггүй болов.'], [13.2, 17.6, 'Хоёулаа өдрөөс өдөрт улам ядарч байлаа.']] },

  fired: { d: 14, music: 'secret', subs: [[6.3, 13.4, 'Тэмүүлэн ажлаасаа халагдлаа.']], f: (c, t) => {
    const g = c.createLinearGradient(0, 0, 0, 820); g.addColorStop(0, '#dfe5ec'); g.addColorStop(1, '#c4ccd8'); c.fillStyle = g; c.fillRect(0, 0, W, 820);
    c.fillStyle = '#8c939e'; c.fillRect(0, 820, W, 260); c.fillStyle = '#6b727c'; c.fillRect(0, 812, W, 12);
    windowFrame(c, 180, 200, 420, 360, skyDay(0, t));
    c.fillStyle = '#f2f6fb'; c.fillRect(760, 40, 400, 26); glow(c, 960, 80, 500, 0.4, '230,240,255');
    clock(c, 1400, 230, 17 + t * 0.02);
    c.fillStyle = '#7d8590'; c.fillRect(1600, 470, 180, 350); c.fillStyle = '#69707a'; [520, 640, 760].forEach(yy => { c.fillRect(1615, yy - 40, 150, 4); c.fillRect(1670, yy - 20, 40, 10); });
    plant(c, 1690, 470, 0.9, t);
    // boss behind desk
    chair(c, 690, 905, 1);
    person(c, { x: 700, y: 905, s: 1.05, type: 'm', top: '#4b525e', pants: '#2b3044', sit: 'chair', face: 1, armF: 1.3 + (t > 1.5 && t < 3.5 ? 0.25 : 0), bendF: -0.4, mouth: t > 1 && t < 4.5 && Math.sin(t * 9) > 0 ? 'open' : 'flat', brow: 'sad', blink: blinkAt(t) });
    c.fillStyle = '#c9c1b4'; c.fillRect(560, 690, 520, 22); c.fillStyle = '#5a4636'; c.fillRect(580, 712, 480, 190);
    // paper slides
    const px = lerp(800, 1000, prog(t, 2, 3.5));
    if (t < 6) { c.save(); c.translate(px, 684); c.rotate(-0.05); c.fillStyle = '#fff'; c.fillRect(-60, -8, 120, 10); c.restore(); }
    // Temuulen
    const leave = prog(t, 7.5, 13);
    const tm = person(c, { x: lerp(1220, 2150, leave), y: 905, s: 1.05, type: 'm', top: T1, pants: '#2b3044', face: t > 7.3 ? 1 : -1, walk: t > 7.5 ? t * 6 : undefined, mouth: t > 3.5 ? 'sad' : 'flat', brow: t > 3 ? 'sad' : null, armF: t > 6.5 ? 1.35 : (t > 4 && t < 6.5 ? 1.0 : undefined), armB: t > 6.5 ? 1.2 : undefined, bendF: 0.1, bendB: 0.1, headTilt: t > 4 ? 0.12 : 0, blink: blinkAt(t, 1) });
    if (t > 4 && t < 6.5) { c.save(); c.translate(tm.hf[0], tm.hf[1] - 10); c.fillStyle = '#fff'; c.fillRect(-10, -60, 70, 90); c.fillStyle = '#c0392b'; c.font = '13px FiraB'; c.fillText('ЧӨЛӨӨЛӨХ', -6, -40); c.restore(); }
    if (t > 6.5) box(c, tm.hf[0] + 20, tm.hf[1] + 60, 150, 110, '#c89a62');
    if (t > 1 && t < 4.8) bubble(c, 760, 300, 'Уучлаарай, компани хүн цөөлж байгаа юм.', { alpha: prog(t, 1, 1.3), size: 38, tailDir: 1 });
    vignette(c, 0.4);
  } },
  taxi: { d: 16, music: 'secret', subs: [[7.4, 11.4, 'Гэвч тэр энэ тухай Номинд хэлж зүрхэлсэнгүй.'], [11.8, 15.8, 'Оронд нь шөнө болгон такси барьж, гэртээ оройтож ирдэг болов.']], f: (c, t) => {
    const drive = prog(t, 8, 9.5); const scroll = t > 8 ? (t - 8) * 420 * drive : 0;
    streetBg(c, t, scroll);
    car(c, 900, 905 + (t > 8 ? Math.sin(t * 14) * 2 : 0), 1.25, { driver: true, taxi: prog(t, 6.2, 6.8), wheel: scroll / 40, lights: t > 7, passenger: t > 10.5 });
    phoneCard(c, 1420, 430, 'Номин', 'Хэзээ ирэх вэ? Тэнгис чамайг хүлээж байна', prog(t, 1, 1.6) * (1 - prog(t, 5.6, 6.2)), {});
    vignette(c, 0.5);
  } },
  door: { d: 12.5, music: 'tense', subs: [[5.8, 9, 'Номин: Чи сүүлийн үед байнга шөнө орой ирэх боллоо.']], f: (c, t) => {
    c.save(); cam(c, 640, 560, lerp(1, 1.35, prog(t, 9.5, 12.5)));
    argRoom(c, t, { clock: 1.33 + t * 0.003, light: 0.75, doorOpen: prog(t, 0.8, 1.6) * (1 - prog(t, 4, 4.6)) });
    const nStand = t > 5.2;
    if (!nStand) chair(c, 1250, 905, 1);
    person(c, { x: nStand ? 1180 : 1230, y: 905, s: 1.0, type: 'f', top: '#8f6fa8', pants: '#4b3b47', face: -1, sit: nStand ? null : 'chair', armF: nStand ? 0.3 : 1.3, bendF: nStand ? 0.3 : -0.3, mouth: t > 8.8 && t < 11 && Math.sin(t * 9) > 0 ? 'open' : 'flat', brow: 'sad', tired: true, blink: blinkAt(t, 2) });
    table(c, 960, 905, 460); bills(c);
    const tx = lerp(230, 640, prog(t, 1.4, 4.4));
    person(c, { x: tx, y: 905, s: 1.05, type: 'm', top: '#2f4f6f', pants: '#2b3044', hat: '#b23a3a', walk: t > 1.4 && t < 4.4 ? t * 6.5 : undefined, tired: true, mouth: 'flat', brow: t > 9 ? 'sad' : null, blink: blinkAt(t), headTilt: t > 9.5 ? -0.05 : 0 });
    if (t > 8.8) bubble(c, 1150, 330, 'Чи хаана явсан юм бэ?', { alpha: prog(t, 8.8, 9.1), size: 46 });
    tint(c, '#2b3a6b', 0.25);
    c.restore(); vignette(c, 0.55 + prog(t, 10, 12.5) * 0.25);
  } },

  // ----- 1А -----
  truth: { d: 22, music: 'soft', subs: [[1, 6.6, 'Тэмүүлэн: Би сарын өмнө ажлаасаа халагдсан. Түүнээс хойш шөнө такси барьж байгаа.'], [7, 10.6, 'Тэмүүлэн: Чамайг санаа зовох байх гэж айгаад хэлж чадаагүй.'], [11, 14.8, 'Номин: Яагаад надад хэлээгүй юм бэ? Бид гэр бүл шүү дээ.'], [16, 21.4, 'Номин: Зүгээр ээ. Хамтдаа нэг арга олъё.']], f: (c, t) => {
    argRoom(c, t, { clock: 1.4 + t * 0.003, light: 0.85 });
    chair(c, 760, 905, -1); chair(c, 1160, 905, 1);
    const hold = prog(t, 15, 16.5);
    person(c, { x: 790, y: 905, s: 1.05, type: 'm', top: '#2f4f6f', pants: '#2b3044', sit: 'chair', face: 1, armF: lerp(0.8, 1.55, hold), bendF: lerp(-0.2, 0, hold), mouth: t > 17 ? 'smile' : (t < 10 && Math.sin(t * 8) > 0.3 ? 'open' : 'sad'), brow: t < 17 ? 'sad' : null, headTilt: t < 10 ? 0.15 : 0, blink: blinkAt(t) });
    person(c, { x: 1130, y: 905, s: 1.0, type: 'f', top: '#8f6fa8', pants: '#4b3b47', sit: 'chair', face: -1, armF: lerp(0.8, 1.55, hold), bendF: lerp(-0.2, 0, hold), mouth: t > 17 ? 'smile' : (t > 11 && t < 14.8 && Math.sin(t * 8) > 0.3 ? 'open' : 'sad'), brow: t < 16 ? 'sad' : null, tear: t > 8 && t < 14 ? ((t - 8) * 0.4) % 1 : 0, blink: blinkAt(t, 1.4) });
    table(c, 960, 905, 460); bills(c);
    c.fillStyle = '#b23a3a'; c.beginPath(); c.arc(840, 693, 28, Math.PI, 0); c.fill();
    if (hold > 0.9) { glow(c, 960, 640, 220, 0.6); heart(c, 960, 600 - (t - 16.5) * 12, 1.6, '#e8505b', prog(t, 16.5, 17.2) * (1 - prog(t, 20, 21))); }
    tint(c, '#2b3a6b', 0.2 * (1 - hold)); vignette(c, 0.5);
  } },
  plan: { d: 14, music: 'hope', subs: [[10, 13.8, 'Анх удаа тэд асуудлаа хамтдаа шийдэж эхэллээ.']], f: (c, t) => {
    argRoom(c, t, { day: true, sky: 2, plant: true, light: 0.2 });
    chair(c, 760, 905, -1); chair(c, 1160, 905, 1);
    person(c, { x: 790, y: 905, s: 1.05, type: 'm', top: '#4f8a6b', pants: '#2b3044', sit: 'chair', face: 1, armF: 1.4 + Math.sin(t * 3) * 0.05, bendF: -0.3, mouth: 'smile', blink: blinkAt(t) });
    person(c, { x: 1130, y: 905, s: 1.0, type: 'f', top: '#e0a14f', pants: '#4b3b47', sit: 'chair', face: -1, armF: 1.45 + Math.sin(t * 16) * 0.05, bendF: -0.2, mouth: t > 5 ? 'grin' : 'smile', blink: blinkAt(t, 1.2) });
    table(c, 960, 905, 460); laptop(c, 930, 695, -1);
    c.fillStyle = '#fff'; c.save(); c.translate(880, 688); c.rotate(0.05); c.fillRect(-60, -10, 120, 14); c.restore();
    // baby on blanket
    c.fillStyle = '#9ec9e8'; c.beginPath(); c.ellipse(1520, 960, 150, 40, 0, 0, 7); c.fill(); baby(c, 1540, 935, 0.9, 0, 0, false);
    // notebook overlay
    const a = prog(t, 0.8, 1.6);
    c.save(); c.globalAlpha = a; c.translate(380, 300); c.rotate(-0.04);
    c.fillStyle = '#fffdf3'; c.fillRect(-260, -170, 520, 340); c.fillStyle = '#e8505b'; c.fillRect(-260, -170, 14, 340);
    c.fillStyle = '#2d3142'; c.font = '34px FiraB'; c.fillText('Бидний төлөвлөгөө', -215, -110);
    ['Шинэ ажил хайх', 'Номин гэрээсээ ажил хийх', 'Илүү зардлаа хасах'].forEach((s, i) => { const k = prog(t, 2.5 + i * 2.2, 3.2 + i * 2.2); if (k <= 0) return; c.globalAlpha = a * k; c.strokeStyle = '#2d3142'; c.lineWidth = 3; c.strokeRect(-215, -60 + i * 70, 28, 28); c.font = '30px Fira'; c.fillText(s, -170, -35 + i * 70); });
    c.restore();
    vignette(c, 0.3);
  } },
  call: { d: 17, music: 'hope', f: (c, t) => OLD[7].f(c, t), subs: [[0.6, 4.4, 'Тэр орой Номины эмээ утсаар ярилаа.'], [4.8, 9.6, 'Эмээ: Хотод амьдрахад хэцүү байгаа биз дээ, миний охин.'], [10, 15.6, 'Эмээ: Нөхөр, хүүтэйгээ хөдөө нүүгээд ир. Энд гэр ч бий, мал ч бий.']] },

  // ----- 1Б -----
  lie: { d: 10, music: 'tense', subs: [[5.3, 9.6, 'Номин юу ч хэлсэнгүй. Гэхдээ ямар нэг юм болоод байгааг мэдэрлээ.']], f: (c, t) => {
    argRoom(c, t, { clock: 1.36, light: 0.75 });
    person(c, { x: 1180, y: 905, s: 1.0, type: 'f', top: '#8f6fa8', pants: '#4b3b47', face: -1, armF: 0.3, mouth: 'flat', brow: 'sad', tired: true, blink: blinkAt(t, 2), headTilt: t > 5 ? 0.12 : 0 });
    table(c, 960, 905, 460); bills(c);
    const go = prog(t, 4.6, 9.5);
    person(c, { x: lerp(640, 80, go), y: 905, s: 1.05, type: 'm', top: '#2f4f6f', pants: '#2b3044', face: t > 4.5 ? -1 : 1, walk: t > 4.6 ? t * 6.5 : undefined, mouth: t < 4.5 ? 'smile' : 'flat', tired: true, blink: blinkAt(t) });
    if (t > 0.8 && t < 4.5) bubble(c, 640, 330, 'Ажил их байсан юм. Унтъя даа.', { alpha: prog(t, 0.8, 1.1), size: 42 });
    tint(c, '#2b3a6b', 0.28); vignette(c, 0.55);
  } },
  window: { d: 16, music: 'tense', subs: [[10.6, 15.6, 'Нууц удаан нуугддаггүй.']], f: (c, t) => {
    // outside view
    c.save(); c.beginPath(); c.rect(560, 120, 1200, 640); c.clip();
    c.save(); c.translate(560, 80); c.scale(0.625, 0.625);
    const sc = 0; streetBg(c, t, sc);
    const cx = t < 6.5 ? lerp(-400, 1100, prog(t, 1.5, 6.5)) : (t < 9 ? 1100 : lerp(1100, 2600, prog(t, 9, 12.5)));
    const moving = (t > 1.5 && t < 6.5) || (t > 9 && t < 12.5);
    // passenger walks to car
    if (t > 6.6 && t < 8.6) { person(c, { x: lerp(1600, 1150, prog(t, 6.6, 8.4)), y: 860, s: 0.9, type: 'm', top: '#7a5a8a', pants: '#333', face: -1, walk: t * 7, mouth: 'flat' }); }
    car(c, cx, 915, 1.2, { driver: true, taxi: 1, wheel: cx / 40, lights: true, passenger: t > 8.6 });
    c.restore();
    c.restore();
    // room wall around window
    const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#3a3550'); g.addColorStop(1, '#2a2638'); c.fillStyle = g;
    c.beginPath(); c.rect(0, 0, W, H); c.rect(560, 120, 1200, 640); c.fill('evenodd');
    c.strokeStyle = '#d9d3c6'; c.lineWidth = 22; c.strokeRect(560, 120, 1200, 640); c.lineWidth = 12; c.beginPath(); c.moveTo(1160, 120); c.lineTo(1160, 760); c.stroke();
    c.fillStyle = '#cfc8ba'; c.fillRect(530, 760, 1260, 26);
    curtains(c, 560, 120, 1200, 640, '#6b4a5e');
    // Nomin silhouette with baby
    const nm = person(c, { x: 360, y: 1000, s: 1.15, type: 'f', top: '#5f4b70', pants: '#3b2f3f', face: 1, armF: 1.5, armB: 1.4, bendF: 0.9, bendB: 0.9, mouth: t > 8 ? 'open' : 'flat', brow: 'sad', blink: blinkAt(t, 1) });
    baby(c, nm.hf[0] + 10, nm.hf[1] + 50, 1, 0, 0, true);
    if (t > 8 && t < 10.5) bubble(c, 420, 330, '?!', { alpha: prog(t, 8, 8.3), size: 60 });
    // zoom ring around driver when stopped
    if (t > 7 && t < 9.2) { const rx = 560 + (1100 + 50 * 1.2) * 0.625, ry = 80 + (915 - 88 * 1.2) * 0.625; c.strokeStyle = `rgba(255,90,90,${0.8 * Math.sin(prog(t, 7, 9.2) * Math.PI)})`; c.lineWidth = 6; c.beginPath(); c.arc(rx, ry, 50, 0, 7); c.stroke(); }
    vignette(c, 0.5);
  } },
  fight: { d: 17, music: 'tense', subs: [[12.8, 16.6, 'Тэмүүлэн хаалгаа саваад гараад явчихлаа.']], f: (c, t) => { window.ARG_N = 'Чамайг такси барьж байхыг харсан!'; window.ARG_T = 'Чи ойлгохгүй! Бүгдийг би ганцаараа үүрч байна!'; OLD[5].f(c, t); } },
  alone: { d: 16, music: 'sad', subs: [[1.4, 5, 'Гэнэт байшин даяар цахилгаан тасарлаа.'], [5.5, 10, 'Номин хүүтэйгээ харанхуйд ганцаараа үлдлээ.'], [11, 15.6, 'Тэр утсаа барьсаар удаан бодлоо.']], f: (c, t) => { window.BO_ALONE = true; window.BO_DARK = false; OLD[6].f(c, t); window.BO_ALONE = false; } },

  // ----- 2БА -----
  callback: { d: 9, music: 'sad', subs: [[0.8, 5, 'Тэмүүлэний утас дуугарлаа.']], f: (c, t) => {
    const turn = t > 5.2; const scroll = turn ? -(t - 5.6) * 500 * prog(t, 5.6, 6.6) : (1 - prog(t, 0, 1.2)) * 300 + 1000;
    streetBg(c, t, scroll);
    car(c, 900, 905, 1.25, { driver: true, taxi: 1, face: turn ? -1 : 1, wheel: scroll / 40, lights: true });
    phoneCard(c, 1420, 430, 'Номин', 'залгаж байна...', prog(t, 0.6, 1.1) * (1 - prog(t, 4.6, 5.1)), { call: true, t });
    vignette(c, 0.5);
  } },
  candle: { d: 22, music: 'hope', subs: [[0.5, 4, 'Тэмүүлэн тэр дороо гэр лүүгээ буцлаа.'], [8.2, 11, 'Тэмүүлэн: Уучлаарай... Би ажилгүй болчихсон. Чамд хэлэхээс ичээд байсан юм.'], [11.2, 14.6, 'Номин: Чи үүнийг ганцаараа үүрэх ёсгүй. Намайг бас уучлаарай.'], [15.5, 21.4, 'Гэрэл тасарсан тэр шөнө тэд хамгийн ойр байлаа.']], f: (c, t) => { window.BO_DARK = true; OLD[6].f(c, t); window.BO_DARK = false; } },

  // ----- Төгсгөл 1 -----
  montage: { d: 14, music: 'hope', subs: [[0.5, 4.6, 'Номин гэрээсээ дизайны ажил хийж эхэллээ.'], [5.2, 8.8, 'Тэмүүлэн өдөр такси барьж, орой ажил хайна.'], [9.6, 13.6, 'Тэгээд нэг өдөр...']], f: (c, t) => {
    if (t < 5) { OLD[2].f(c, 6.2 + t); return; }
    argRoom(c, t, { light: 1, plant: true });
    chair(c, 1000, 905, 1);
    const happy = t > 10.5;
    const jump = happy ? Math.abs(Math.sin((t - 10.5) * 6)) : 0;
    if (!happy) {
      person(c, { x: 990, y: 905, s: 1.05, type: 'm', top: '#4f8a6b', pants: '#2b3044', sit: 'chair', face: -1, armF: 1.45 + Math.sin(t * 18) * 0.06, armB: 1.4, bendF: 0.2, bendB: 0.2, mouth: t > 9.5 ? 'open' : 'flat', tired: true, blink: blinkAt(t) });
      table(c, 960, 905, 520); laptop(c, 830, 695, 1);
    } else {
      table(c, 960, 905, 520); laptop(c, 830, 695, 1);
      person(c, { x: 760, y: 905 - jump * 90, s: 1.05, type: 'm', top: '#4f8a6b', pants: '#2b3044', face: 1, armF: 2.8, armB: 2.7, bendF: 0.1, bendB: 0.1, mouth: 'grin', eyesClosed: true });
      person(c, { x: 1180, y: 905 - jump * 70, s: 1.0, type: 'f', top: '#e0a14f', pants: '#4b3b47', face: -1, walk: undefined, armF: 2.6, armB: 2.5, mouth: 'grin', eyesClosed: true });
      for (let i = 0; i < 10; i++) { const k = ((t - 10.5) * 0.4 + i / 10) % 1; heart(c, 960 + Math.sin(i * 2.7) * 360 * k, 560 - k * 400, 1.4 + (i % 3) * 0.5, i % 2 ? '#e8505b' : '#ffb347', Math.sin(k * Math.PI)); }
    }
    // email popup
    const ea = prog(t, 9.4, 9.9) * (1 - prog(t, 13.4, 14));
    if (ea > 0) { c.save(); c.globalAlpha = ea; c.translate(960, 300); const sc = 0.9 + 0.1 * ea; c.scale(sc, sc);
      c.fillStyle = '#fff'; c.shadowColor = 'rgba(0,0,0,.3)'; c.shadowBlur = 30; rr(c, -380, -110, 760, 220, 24); c.fill(); c.shadowBlur = 0;
      c.fillStyle = '#3fb36b'; c.beginPath(); c.arc(-290, 0, 50, 0, 7); c.fill(); c.strokeStyle = '#fff'; c.lineWidth = 12; c.beginPath(); c.moveTo(-315, 0); c.lineTo(-295, 22); c.lineTo(-262, -20); c.stroke();
      c.fillStyle = '#777'; c.font = '28px Fira'; c.fillText('Шинэ имэйл', -210, -30); c.fillStyle = '#222'; c.font = '46px FiraB'; c.fillText('Та ажилд тэнцлээ!', -210, 30);
      c.restore(); }
    vignette(c, 0.35);
  } },
  steps: { d: 19, music: 'bright', f: (c, t) => OLD[8].f(c, t), subs: [[0.6, 6.4, 'Хавар боллоо. Цонхон дээрх цэцэг ургаж, Тэнгис ч томорчээ.'], [7, 11.8, 'Нэг өдөр Тэнгис анх удаа алхлаа.'], [16, 18.8, 'Шууд л аав руугаа.']] },
  cityEnd: { d: 15, music: 'end', f: (c, t) => OLD[9].f(c, t), subs: [[0.8, 5.4, 'Гэр бүл гэдэг том байшин биш.'], [5.8, 11, 'Хоёулаа хамтдаа асаадаг жижигхэн гэрэл юм.']] },

  // ----- Төгсгөл 2 -----
  truck: { d: 12, music: 'steppe', subs: [[0.8, 5.8, 'Тэд эмээгийнд, хөдөө нүүхээр шийдлээ.'], [6.3, 11.4, 'Бүх юм нь ганцхан ачааны машинд багтчихлаа.']], f: (c, t) => {
    const scroll = t * 380; steppeBg(c, t, scroll, 0.15);
    c.fillStyle = '#b89b72'; c.fillRect(0, 900, W, 60);
    c.fillStyle = 'rgba(255,255,255,.25)'; for (let i = 0; i < 14; i++) { const dx = ((i * 180 - scroll) % 2520 + 2520) % 2520 - 200; c.fillRect(dx, 928, 70, 5); }
    const bx = 860, by = 935 + Math.sin(t * 13) * 2;
    // cargo
    c.fillStyle = '#5b7a99'; c.fillRect(bx - 260, by - 150, 300, 120);
    box(c, bx - 200, by - 150, 90, 70); box(c, bx - 110, by - 150, 80, 60, '#d3a873'); plant(c, bx - 30, by - 150, 0.55, t);
    c.fillStyle = '#e46b3c'; c.fillRect(bx - 250, by - 236, 120, 18); // rolled carpet
    // cab
    c.fillStyle = '#3d7bb5'; rr(c, bx + 40, by - 170, 170, 140, 20); c.fill();
    c.fillStyle = '#bfe3ff'; rr(c, bx + 120, by - 150, 75, 60, 10); c.fill();
    c.fillStyle = SKIN; c.beginPath(); c.arc(bx + 150, by - 112, 16, 0, 7); c.fill(); c.fillStyle = '#1d1612'; c.beginPath(); c.arc(bx + 150, by - 118, 17, Math.PI, 0); c.fill();
    c.fillStyle = '#2f5f8f'; c.fillRect(bx - 270, by - 40, 490, 22);
    [bx - 190, bx - 40, bx + 150].forEach(wx => { c.fillStyle = '#222'; c.beginPath(); c.arc(wx, by - 12, 34, 0, 7); c.fill(); c.fillStyle = '#999'; c.beginPath(); c.arc(wx, by - 12, 14, 0, 7); c.fill(); });
    // dust
    for (let i = 0; i < 8; i++) { const k = (t * 0.8 + i / 8) % 1; c.fillStyle = `rgba(200,180,140,${0.4 * (1 - k)})`; c.beginPath(); c.arc(bx - 300 - k * 300, by - 20 - k * 40, 20 + k * 40, 0, 7); c.fill(); }
    vignette(c, 0.3);
  } },
  steppe: { d: 20, music: 'steppe', subs: [[0.6, 5.4, 'Архангайд хавар болжээ. Эмээ тэднийг баярлан угтлаа.'], [6, 10.4, 'Тэмүүлэн анх удаа хонь хариулж үзлээ...'], [15.8, 19.6, 'Хот байна уу, хөдөө байна уу — гол нь тэд хамтдаа.']], f: (c, t) => {
    steppeBg(c, t, 0, 0.1);
    ger(c, 1500, 850, 2.0, { t });
    person(c, { x: 1330, y: 880, s: 0.95, type: 'g', top: '#3f7d8c', face: -1, armF: t < 5 ? 2.5 + Math.sin(t * 6) * 0.4 : 0.3, mouth: 'grin', blink: blinkAt(t, 0.4) });
    // sheep
    const sx0 = t < 6 ? 0 : (t - 6) * 60;
    [[200, 900], [330, 950], [470, 910], [600, 960], [380, 1010], [720, 1000]].forEach(([x, y], i) => sheep(c, x + Math.sin(t * 0.8 + i) * 30 + (t > 6 && t < 11 ? Math.sin((t - 6) * 2 + i) * 60 : 0), y, 1.1, t * 6 + i));
    // Temuulen chasing sheep then stands
    const tChase = t > 6 && t < 11;
    const tmX = tChase ? 500 + Math.sin((t - 6) * 2) * 300 : 820;
    const lift = prog(t, 14.5, 15.8);
    person(c, { x: tmX, y: 1000, s: 1.0, type: 'm', top: '#7a5a3a', pants: '#2b3044', face: tChase ? (Math.cos((t - 6) * 2) > 0 ? 1 : -1) : 1, walk: tChase ? t * 10 : undefined, armF: t > 12 ? lerp(1.6, 2.6, lift) : (tChase ? 2.4 : undefined), armB: t > 12 ? lerp(1.5, 2.5, lift) : (tChase ? 2.2 : undefined), bendF: 0.1, bendB: 0.1, mouth: tChase ? 'open' : 'grin', blink: blinkAt(t), eyesClosed: lift > 0.6 });
    // Nomin with laptop on stool
    c.fillStyle = '#8b5e3c'; c.fillRect(1640, 960, 90, 14); /*stool*/ c.fillRect(1650, 974, 10, 50); c.fillRect(1712, 974, 10, 50);
    person(c, { x: 1690, y: 1020, s: 0.95, type: 'f', top: '#e0a14f', pants: '#4b3b47', sit: 'chair', face: -1, armF: t > 15 ? 2.5 + Math.abs(Math.sin(t * 8)) * 0.4 : 1.3, bendF: 0.2, mouth: t > 12 ? 'grin' : 'smile', blink: blinkAt(t, 2) });
    // toddler walks to dad
    const w = prog(t, 11, 14.5);
    if (lift <= 0) toddler(c, lerp(1250, 900, w), 1010, 0.85, t > 11 ? t * 6 : 0, 0.6);
    else toddler(c, lerp(900, 830, lift), lerp(1010, 700, lift), 0.85, 0, 1);
    if (t > 13.2 && t < 15.8) bubble(c, 900, 520, 'Аав аа!', { alpha: prog(t, 13.2, 13.5), size: 50 });
    vignette(c, 0.3);
  } },
  steppeNight: { d: 17, music: 'end', subs: [[1, 7.4, 'Эмээ: Гэр бүл гэдэг бие биенээ буруутгах биш, нэг зүг рүү хамт харах юм шүү.'], [7.8, 11.4, 'Гэр хаана байх нь чухал биш. Дотор нь хэн байх нь л чухал.']], f: (c, t) => {
    const k = lerp(1, 2, prog(t, 0, 9));
    steppeBg(c, t, 0, k);
    ger(c, 960, 860, 1.6, { t, night: k > 1.5, doorLit: prog(t, 3, 7) * 0.8, toonoLit: prog(t, 3, 7) * 0.6 });
    if (t > 11.8) { c.fillStyle = `rgba(0,0,0,${prog(t, 11.8, 13) * 0.5})`; c.fillRect(0, 0, W, H); }
    titleText(c, 'ТӨГСГӨЛ', '«Талын гэрэл»', prog(t, 12, 13.2), 230);
    vignette(c, 0.4);
  } },

  // ----- Төгсгөл 3 -----
  leave: { d: 12, music: 'sad', subs: [[0.8, 5.6, 'Маргааш өглөө нь Номин хүүгээ аваад ээжийндээ явчихлаа.'], [6.4, 11.4, 'Ширээн дээр нэг жижиг захидал үлдсэн байв.']], f: (c, t) => {
    argRoom(c, t, { day: true, sky: 0, light: 0.1, doorOpen: prog(t, 1, 2) });
    table(c, 960, 905, 460);
    c.save(); c.translate(960, 686); c.rotate(0.06); c.fillStyle = '#fffdf3'; c.fillRect(-45, -12, 90, 16); c.restore();
    if (t > 6.5) glow(c, 960, 680, 160, prog(t, 6.5, 7.5) * 0.6, '255,255,230');
    const go = prog(t, 1.5, 8.5);
    if (go < 1) {
      const x = lerp(1300, 200, go);
      const nm = person(c, { x, y: 905, s: 1.0, type: 'f', top: '#8f6fa8', pants: '#4b3b47', face: -1, walk: t > 1.5 ? t * 6 : undefined, armF: 1.5, bendF: 0.9, armB: 0.1, mouth: 'sad', brow: 'sad', blink: blinkAt(t) });
      baby(c, nm.hf[0] - 10, nm.hf[1] + 50, 0.85, 0, 0, true);
      c.fillStyle = '#6b5a8e'; rr(c, x + 60, 790, 110, 110, 12); c.fill(); c.fillStyle = '#333'; c.fillRect(x + 100, 770, 30, 22);
      [x + 80, x + 150].forEach(wx => { c.fillStyle = '#222'; c.beginPath(); c.arc(wx, 905, 9, 0, 7); c.fill(); });
    }
    tint(c, '#7f8fb8', 0.15); vignette(c, 0.45);
  } },
  emptyRoom: { d: 17, music: 'sad', subs: [], f: (c, t) => {
    const lightOn = t > 1.2 && t < 9.6;
    argRoom(c, t, { clock: 19.5, light: lightOn ? 1 : 0, doorOpen: prog(t, 0, 0.4) * (1 - prog(t, 1.5, 2)) });
    const sit = t > 10.2;
    if (sit) chair(c, 780, 905, -1);
    const tm = person(c, { x: sit ? 810 : lerp(240, 760, prog(t, 0.3, 2.8)), y: 905, s: 1.05, type: 'm', top: '#2f4f6f', pants: '#2b3044', sit: sit ? 'chair' : null, walk: t > 0.3 && t < 2.8 ? t * 6.5 : undefined, face: 1, armF: (t > 3.5 && t < 9.4) ? 1.5 : (sit ? 1.7 : undefined), bendF: (t > 3.5 && t < 9.4) ? 0.3 : 1.2, mouth: 'sad', brow: 'sad', headTilt: sit ? 0.25 : 0, blink: blinkAt(t), tired: true });
    table(c, 960, 905, 460);
    if (t < 3.5) { c.save(); c.translate(960, 686); c.rotate(0.06); c.fillStyle = '#fffdf3'; c.fillRect(-45, -12, 90, 16); c.restore(); }
    if (!lightOn) { tint(c, '#0a0d1e', t < 1.2 ? 0.7 : prog(t, 9.6, 10.4) * 0.82, 'source-over'); }
    else glow(c, 960, 200, 800, 0.7);
    if (sit) { c.fillStyle = '#1b1b22'; rr(c, tm.hf[0] - 12, tm.hf[1] - 30, 26, 46, 5); c.fill(); glow(c, tm.hf[0], tm.hf[1] - 30, 180, 0.7, '150,200,255'); }
    noteCard(c, 'Чи надаас нууж болохгүй байсан. Надад бодох хугацаа хэрэгтэй.', '— Номин', prog(t, 4, 4.6) * (1 - prog(t, 8.6, 9.2)));
    phoneCard(c, 960, 520, 'Номин', 'Уучлаарай, би...', prog(t, 11.4, 12) * (1 - prog(t, 16.4, 17)), { type: lerp(0, 15, prog(t, 12.2, 14.6)), t, bg: '#e9edf5' });
    vignette(c, 0.55);
  } },
  darkCity: { d: 14, music: 'end', subs: [[1, 6.4, 'Ганцхан үнэн үг энэ гэрлийг асааж чадах байсан юм.']], f: (c, t) => {
    city(c, t + 3, lerp(1.6, 1.0, ease(t / 7)), 0.9, 0);
    if (t > 7.4) { c.fillStyle = `rgba(0,0,0,${prog(t, 7.4, 8.6) * 0.55})`; c.fillRect(0, 0, W, H); }
    titleText(c, 'ТӨГСГӨЛ', '«Унтарсан гэрэл»', prog(t, 7.6, 8.8), 470);
  } },
};

// түүхийн бүтэц
const STORY = {
  start: { segs: ['title', 'movein', 'routine', 'news', 'baby', 'fired', 'taxi', 'door'], poll: 'd1' },
  b1a: { segs: ['truth', 'plan', 'call'], poll: 'd2a' },
  b1b: { segs: ['lie', 'window', 'fight', 'alone'], poll: 'd2b' },
  b2ba: { segs: ['callback', 'candle'], next: 'end1' },
  end1: { segs: ['montage', 'steps', 'cityEnd'], ending: 1 },
  end2: { segs: ['truck', 'steppe', 'steppeNight'], ending: 2 },
  end3: { segs: ['leave', 'emptyRoom', 'darkCity'], ending: 3 },
  replay: { segs: ['door'], poll: 'd1' },
};
const POLLS = {
  d1: { q: 'Тэмүүлэн юу гэж хэлэх вэ?', a: 'Үнэнээ хэлнэ', b: 'Худлаа хэлж нууна', A: 'b1a', B: 'b1b' },
  d2a: { q: 'Тэд хаана амьдрах вэ?', a: 'Хөдөө, эмээгийнд нүүнэ', b: 'Хотдоо үлдээд хичээнэ', A: 'end2', B: 'end1' },
  d2b: { q: 'Номин юу хийх вэ?', a: 'Тэмүүлэн рүү залгана', b: 'Хүүгээ аваад ээжийндээ явна', A: 'b2ba', B: 'end3' },
};
const ENDINGS = { 1: 'Жижигхэн гэрэл', 2: 'Талын гэрэл', 3: 'Унтарсан гэрэл' };

function drawSubs(c, subs, t) {
  const s = subs.find(s => t >= s[0] && t < s[1]); if (!s) return;
  const a = Math.min(lin(t, s[0], s[0] + 0.35), 1 - lin(t, s[1] - 0.35, s[1]));
  c.save(); c.globalAlpha = a; c.font = '50px Fira'; c.textAlign = 'center'; c.textBaseline = 'middle';
  const lines = wrap(c, s[2], 1500); const lh = 64; const bw = Math.max(...lines.map(l => c.measureText(l).width)) + 70, bh = lines.length * lh + 34;
  const by = 1010 - bh;
  c.fillStyle = 'rgba(10,10,20,.58)'; rr(c, W / 2 - bw / 2, by, bw, bh, 22); c.fill();
  c.fillStyle = '#fffaf0'; lines.forEach((l, i) => c.fillText(l, W / 2, by + 17 + lh / 2 + i * lh + 2));
  c.restore();
}
function wrap(c, text, maxW) { const words = text.split(' '); const lines = []; let cur = ''; words.forEach(w => { const tst = cur ? cur + ' ' + w : w; if (c.measureText(tst).width > maxW && cur) { lines.push(cur); cur = w; } else cur = tst; }); if (cur) lines.push(cur); return lines; }
function renderSeg(c, name, t) {
  const sg = SEG[name];
  c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.fillStyle = '#000'; c.fillRect(0, 0, W, H);
  sg.f(c, Math.min(t, sg.d - 0.001));
  c.restore();
  const a = 1 - Math.min(lin(t, 0, 0.5), 1 - lin(t, sg.d - 0.5, sg.d));
  if (a > 0) { c.fillStyle = `rgba(0,0,0,${a})`; c.fillRect(0, 0, W, H); }
  drawSubs(c, sg.subs || [], t);
}
