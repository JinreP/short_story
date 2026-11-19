// Том дэлгэцийн удирдлага: дүр зураг тоглуулах, санал хураах, хөгжим
const VOTE_SECONDS = 20;
const $ = id => document.getElementById(id);
const cv = $('c'), ctx = cv.getContext('2d');
const stage = $('stage');
const socket = io();

function fit() {
  const s = Math.min(innerWidth / 1920, innerHeight / 1080);
  stage.style.transform = `translate(${(innerWidth - 1920 * s) / 2}px,${(innerHeight - 1080 * s) / 2}px) scale(${s})`;
}
addEventListener('resize', fit); fit();
const show = (id, on) => $(id).classList.toggle('show', on);

// ---------- QR / холболт ----------
fetch('/config').then(r => r.json()).then(c => {
  document.querySelectorAll('img.qr').forEach(i => i.src = '/qr.svg');
  const short = c.joinUrl.replace(/^https?:\/\//, '');
  $('url1').textContent = short; $('url2').textContent = short;
});
socket.on('connect', () => socket.emit('hello', 'screen'));
socket.on('count', n => { $('count1').textContent = n; $('count2').textContent = n; });

// ---------- хөгжим ----------
const music = {}; let curMood = null, muted = false;
function track(m) { if (!music[m]) { const a = new Audio(`audio/${m}.mp3`); a.loop = true; a.volume = 0; music[m] = a; } return music[m]; }
function setMood(m) {
  if (m === curMood) return;
  const prev = curMood ? music[curMood] : null; curMood = m;
  const next = m ? track(m) : null;
  if (next) { next.currentTime = 0; next.play().catch(() => {}); }
  const t0 = performance.now();
  const step = () => {
    const k = Math.min(1, (performance.now() - t0) / 1500);
    if (prev && prev !== next) prev.volume = (muted ? 0 : 0.7) * (1 - k);
    if (next) next.volume = (muted ? 0 : 0.7) * k;
    if (k < 1) requestAnimationFrame(step); else if (prev && prev !== next) prev.pause();
  };
  step();
}
// энгийн дуу эффект
let actx = null;
function beep(freq, dur, vol = 0.15, type = 'sine', when = 0) {
  if (muted) return; actx = actx || new AudioContext();
  const o = actx.createOscillator(), g = actx.createGain(); o.type = type; o.frequency.value = freq;
  const t = actx.currentTime + when; g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(actx.destination); o.start(t); o.stop(t + dur + 0.05);
}
const SFX = {
  thump: () => { beep(55, 0.6, 0.5); beep(1800, 0.05, 0.08, 'square'); },
  ring: () => { [0, 0.25].forEach(w => { beep(880, 0.18, 0.12, 'sine', w); beep(1320, 0.18, 0.06, 'sine', w); }); },
  tick: () => beep(1000, 0.06, 0.08, 'square'),
  win: () => { [523, 659, 784].forEach((f, i) => beep(f, 0.5, 0.12, 'triangle', i * 0.09)); },
  door: () => { beep(90, 0.3, 0.4, 'square'); beep(60, 0.4, 0.4); },
};
const SFX_AT = { alone: [[0.8, 'thump']], fight: [[13.2, 'door']], callback: [[0.7, 'ring'], [1.7, 'ring'], [2.7, 'ring'], [3.7, 'ring']], taxi: [[1.0, 'tick']] };

// ---------- тоглуулагч ----------
let state = 'lobby'; // lobby | play | vote | end
let node = null, queue = [], seg = null, segT = 0, paused = false, last = performance.now();
let reached = new Set(), lobbyT = 0, pendingPoll = null;

function goNode(name) {
  node = name; queue = STORY[name].segs.slice(); nextSeg();
}
function nextSeg() {
  if (queue.length) {
    seg = queue.shift(); segT = 0; state = 'play';
    setMood(SEG[seg].music);
    show('badge', true);
    return;
  }
  const n = STORY[node];
  if (n.poll) startVote(n.poll);
  else if (n.next) goNode(n.next);
  else if (n.ending) endScreen(n.ending);
}

// ---------- санал хураалт ----------
let vote = null;
function startVote(pid) {
  const p = POLLS[pid];
  state = 'vote'; show('badge', false);
  vote = { pid, id: null, A: 0, B: 0, endsAt: Date.now() + VOTE_SECONDS * 1000, done: false, lastSec: -1 };
  $('vq').textContent = p.q; $('va').textContent = p.a; $('vb').textContent = p.b;
  $('vtag').textContent = pid === 'd1' ? 'САНАЛ ХУРААЛТ 1 / 2' : 'САНАЛ ХУРААЛТ 2 / 2';
  $('vnote').textContent = '';
  ['optA', 'optB'].forEach(o => $(o).classList.remove('win', 'lose'));
  updTally();
  show('vote', true); setMood('vote');
  socket.emit('startPoll', { id: pid, q: p.q, a: p.a, b: p.b, seconds: VOTE_SECONDS });
}
socket.on('poll', p => { if (vote && p && p.q === POLLS[vote.pid].q && !vote.id) { vote.id = p.id; vote.endsAt = Date.now() + p.left; } });
socket.on('tally', d => { if (vote && d.id === vote.id) { vote.A = d.A; vote.B = d.B; updTally(); } });
socket.on('result', d => { if (vote && d.id === vote.id && !vote.done) { vote.A = d.A; vote.B = d.B; updTally(); finishVote(d.A + d.B === 0 ? null : d.winner); } });
function updTally() {
  const tot = vote.A + vote.B;
  $('nA').textContent = vote.A; $('nB').textContent = vote.B; $('total').textContent = tot;
  $('pA').textContent = tot ? Math.round(vote.A / tot * 100) + '%' : ''; $('pB').textContent = tot ? Math.round(vote.B / tot * 100) + '%' : '';
  document.querySelector('#optA .bar').style.width = (tot ? vote.A / tot * 100 : 0) + '%';
  document.querySelector('#optB .bar').style.width = (tot ? vote.B / tot * 100 : 0) + '%';
}
function finishVote(winner) {
  if (!vote || vote.done) return;
  if (!winner) { vote.waiting = true; $('vnote').textContent = 'Хэн ч санал өгсөнгүй. 1 эсвэл 2 товчоор сонгоно уу.'; return; }
  vote.done = true; vote.waiting = false;
  $(winner === 'A' ? 'optA' : 'optB').classList.add('win'); $(winner === 'A' ? 'optB' : 'optA').classList.add('lose');
  $('vnote').textContent = 'Ихэнх нь сонголоо: ' + (winner === 'A' ? POLLS[vote.pid].a : POLLS[vote.pid].b);
  SFX.win();
  setTimeout(() => { show('vote', false); socket.emit('idle'); const to = POLLS[vote.pid][winner]; vote = null; goNode(to); }, 3200);
}
function manualPick(w) { if (state !== 'vote' || !vote || vote.done) return; if (!vote.waiting) socket.emit('endPoll'); finishVote(w); }
$('optA').onclick = () => manualPick('A'); $('optB').onclick = () => manualPick('B');

// ---------- төгсгөл ----------
function endScreen(n) {
  state = 'end'; reached.add(n); show('badge', false); setMood('end');
  $('endTitle').textContent = `ТӨГСГӨЛ ${n} / 3`;
  $('endLead').textContent = reached.size < 3 ? `Та нар 3 төгсгөлөөс ${reached.size}-ийг нь үзлээ. Өөрөөр сонговол юу болох бол?` : 'Гурван төгсгөлийг бүгдийг нь үзлээ!';
  $('cards').innerHTML = [1, 2, 3].map(i => `<div class="card ${reached.has(i) ? 'got' : 'no'} ${i === n ? 'now' : ''}"><div class="n">Төгсгөл ${i}</div><div class="t">${reached.has(i) ? '«' + ENDINGS[i] + '»' : '?'}</div><div class="s">${reached.has(i) ? (i === n ? 'сая үзсэн' : 'үзсэн') : 'хараахан үзээгүй'}</div></div>`).join('');
  show('end', true);
}
$('replay').onclick = () => { show('end', false); goNode('replay'); };
$('restart').onclick = () => { show('end', false); goNode('start'); };

// ---------- удирдлага ----------
function start() { if (state !== 'lobby') return; show('lobby', false); actx = actx || new AudioContext(); goNode('start'); }
$('startBtn').onclick = start;
addEventListener('keydown', e => {
  if (e.code === 'Space') { e.preventDefault(); if (state === 'lobby') start(); else if (state === 'play') { paused = !paused; show('pause', paused); Object.values(music).forEach(a => paused ? a.pause() : (curMood && music[curMood] === a && a.play())); } }
  if (e.key === 'f' || e.key === 'F') { document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen(); }
  if (e.key === 'm' || e.key === 'M') { muted = !muted; Object.values(music).forEach(a => a.volume = muted ? 0 : (curMood && music[curMood] === a ? 0.7 : 0)); }
  if (e.key === 'ArrowRight' && state === 'play') segT = SEG[seg].d;
  if (state === 'vote') { if (e.key === '1') manualPick('A'); if (e.key === '2') manualPick('B'); if (e.key === 'Enter' && !vote.waiting) socket.emit('endPoll'); }
});

// ---------- үндсэн давталт ----------
function frame(now) {
  const dt = Math.min(0.1, (now - last) / 1000); last = now;
  if (state === 'lobby') { lobbyT += dt; ctx.save(); city(ctx, lobbyT, 1.05, 0.22, 1); ctx.restore(); }
  else if (state === 'play') {
    if (!paused) {
      const prevT = segT; segT += dt;
      (SFX_AT[seg] || []).forEach(([at, k]) => { if (prevT < at && segT >= at) SFX[k](); });
    }
    if (segT >= SEG[seg].d) nextSeg();
    if (state === 'play') renderSeg(ctx, seg, segT);
  } else if (state === 'vote' && vote) {
    const left = Math.max(0, (vote.endsAt - Date.now()) / 1000);
    $('timer').firstElementChild.style.transform = `scaleX(${left / VOTE_SECONDS})`;
    const sec = Math.ceil(left); $('secs').textContent = vote.done || vote.waiting ? '' : sec;
    if (!vote.done && sec !== vote.lastSec && sec <= 5 && sec > 0) SFX.tick();
    vote.lastSec = sec;
  }
  requestAnimationFrame(frame);
}
document.fonts.load('50px Fira').then(() => document.fonts.load('50px FiraB')).then(() => document.fonts.load('800 50px Mont')).finally(() => requestAnimationFrame(frame));
