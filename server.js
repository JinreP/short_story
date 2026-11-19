// «Жижигхэн гэрэл» — интерактив анимэйшн, санал хураалтын сервер
const express = require('express');
const http = require('http');
const os = require('os');
const QRCode = require('qrcode');
const { Server } = require('socket.io');

const PORT = process.env.PORT || 3000;
const app = express();
const server = http.createServer(app);
const io = new Server(server);

function lanIp() {
  for (const list of Object.values(os.networkInterfaces())) {
    for (const n of list || []) if (n.family === 'IPv4' && !n.internal) return n.address;
  }
  return 'localhost';
}
// PUBLIC_URL өгвөл QR тэр хаяг руу заана. Render дээр хаягаа өөрөө таньдаг.
const JOIN_URL = (process.env.PUBLIC_URL || process.env.RENDER_EXTERNAL_URL || `http://${lanIp()}:${PORT}`).replace(/\/$/, '') + '/v';

app.use(express.static(__dirname + '/public'));
app.get('/', (_, res) => res.sendFile(__dirname + '/public/screen.html'));
app.get('/v', (_, res) => res.sendFile(__dirname + '/public/vote.html'));
app.get('/config', (_, res) => res.json({ joinUrl: JOIN_URL }));
app.get('/qr.svg', async (_, res) => {
  const svg = await QRCode.toString(JOIN_URL, { type: 'svg', margin: 1, color: { dark: '#111111', light: '#ffffff' } });
  res.type('image/svg+xml').send(svg);
});

// ---- санал хураалтын төлөв ----
let poll = null; // { id, q, a, b, endsAt, votes: {A,B}, voters: Map(voterId -> 'A'|'B'), open }
let timer = null;
const publicPoll = () => poll && { id: poll.id, q: poll.q, a: poll.a, b: poll.b, endsAt: poll.endsAt, left: Math.max(0, poll.endsAt - Date.now()), open: poll.open, A: poll.votes.A, B: poll.votes.B };
const voterCount = () => io.of('/').adapter.rooms.get('voters')?.size || 0;
const broadcastCount = () => io.to('screen').emit('count', voterCount());

function closePoll() {
  if (!poll || !poll.open) return;
  poll.open = false; clearTimeout(timer);
  const winner = poll.votes.B > poll.votes.A ? 'B' : 'A'; // тэнцвэл А
  poll.winner = winner;
  io.emit('poll', publicPoll());
  io.to('screen').emit('result', { id: poll.id, winner, A: poll.votes.A, B: poll.votes.B });
}

io.on('connection', (socket) => {
  socket.on('hello', (role) => {
    if (role === 'screen') { socket.join('screen'); socket.emit('count', voterCount()); }
    else { socket.join('voters'); broadcastCount(); }
    socket.emit('poll', publicPoll());
  });
  socket.on('disconnect', () => setTimeout(broadcastCount, 50));

  // том дэлгэц санал хураалт эхлүүлнэ
  socket.on('startPoll', ({ id, q, a, b, seconds }) => {
    clearTimeout(timer);
    poll = { id: id + ':' + Date.now(), q, a, b, endsAt: Date.now() + seconds * 1000, votes: { A: 0, B: 0 }, voters: new Map(), open: true };
    timer = setTimeout(closePoll, seconds * 1000);
    io.emit('poll', publicPoll());
  });
  socket.on('endPoll', () => closePoll());
  socket.on('idle', () => { clearTimeout(timer); poll = null; io.emit('poll', null); });

  // утаснаас ирсэн санал
  socket.on('vote', ({ pollId, choice, voterId }) => {
    if (!poll || !poll.open || poll.id !== pollId || !['A', 'B'].includes(choice) || !voterId) return;
    if (poll.voters.has(voterId)) return socket.emit('voted', { pollId, choice: poll.voters.get(voterId) });
    poll.voters.set(voterId, choice); poll.votes[choice]++;
    socket.emit('voted', { pollId, choice });
    io.to('screen').emit('tally', { id: poll.id, A: poll.votes.A, B: poll.votes.B });
  });
});

server.listen(PORT, () => {
  console.log('\n  «Жижигхэн гэрэл» ажиллаж байна');
  console.log(`  Том дэлгэц:     http://localhost:${PORT}`);
  console.log(`  Утаснууд (QR):  ${JOIN_URL}\n`);
});
