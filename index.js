import express from 'express';
import fetch from 'node-fetch';
import cors from 'cors';

const app = express();
app.use(cors());

const API_KEY = process.env.API_FOOTBALL_KEY;
const API_URL = 'https://v3.football.api-sports.io';
const PORT = process.env.PORT || 3000;

let games = [];

// Buscar jogos do dia
async function fetchGames() {
  const today = new Date().toISOString().split('T')[0];

  const res = await fetch(`${API_URL}/fixtures?date=${today}`, {
    headers: { 'X-Api-Key': API_KEY }
  });

  const data = await res.json();
  return data.response || [];
}

// IA simples (sinal de entrada)
function analyze(g) {
  const minute = g.fixture.status.elapsed || 0;
  const goals = (g.goals.home || 0) + (g.goals.away || 0);
  const pressure = Math.floor(Math.random() * 100);

  let signal = 'AGUARDAR';

  if (minute >= 5 && minute <= 25 && goals === 0 && pressure > 60) {
    signal = 'ENTRAR AGORA';
  }

  return { minute, goals, pressure, signal };
}

// Atualizar jogos
async function sync() {
  const raw = await fetchGames();

  games = raw.slice(0, 5).map(g => {
    const a = analyze(g);

    return {
      id: g.fixture.id,
      home: g.teams.home.name,
      away: g.teams.away.name,
      goals: g.goals,
      minute: a.minute,
      pressure: a.pressure,
      signal: a.signal
    };
  });

  console.log("Atualizado:", new Date());
}

// Página principal
app.get('/', (req, res) => {
  res.send(`
  <html>
  <body style="background:#111;color:#fff;font-family:Arial">
  <h1>🔥 Trader Over 1.5</h1>
  <div id="app"></div>

  <audio id="sound" src="https://www.soundjay.com/button/beep-07.wav"></audio>

  <script>
    const evt = new EventSource('/live');
    let last = {};

    evt.onmessage = e => {
      const data = JSON.parse(e.data);
      const app = document.getElementById('app');
      app.innerHTML = '';

      data.forEach(g => {
        const total = (g.goals.home||0)+(g.goals.away||0);

        // alerta de gol
        if(last[g.id] !== undefined && total > last[g.id]){
          document.getElementById('sound').play();
        }

        last[g.id] = total;

        let color = g.signal === 'ENTRAR AGORA' ? '#00ff88' : '#333';

        const div = document.createElement('div');
        div.style = "margin:10px;padding:10px;background:"+color;

        div.innerHTML = \`
          <b>\${g.home} vs \${g.away}</b><br>
          Min: \${g.minute} | Gols: \${g.goals.home} - \${g.goals.away}<br>
          Pressão: \${g.pressure}%<br>
          <b>\${g.signal}</b>
        \`;

        app.appendChild(div);
      });
    };
  </script>
  </body>
  </html>
  `);
});

// SSE (tempo real)
app.get('/live', (req, res) => {
  res.set({
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive'
  });

  setInterval(() => {
    res.write(`data: ${JSON.stringify(games)}\n\n`);
  }, 5000);
});

// Atualização automática
setInterval(sync, 60000);

// Iniciar servidor
app.listen(PORT, () => {
  console.log('Servidor rodando...');
  sync();
});
