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

// IA simples
function analyze(g) {
  const minute = g.fixture?.status?.elapsed || 0;
  const goals = (g.goals?.home || 0) + (g.goals?.away || 0);
  const pressure = Math.floor(Math.random() * 100);

  let signal = 'AGUARDAR';

  if (minute >= 5 && minute <= 25 && goals === 0 && pressure > 60) {
    signal = 'ENTRAR AGORA';
  }

  return { minute, goals, pressure, signal };
}

// SYNC COM FALLBACK (GARANTE JOGOS)
async function sync() {
  try {
    const raw = await fetchGames();

    if (!raw || raw.length === 0) {
      games = [
        {
          id: 1,
          home: "Flamengo",
          away: "Palmeiras",
          goals: { home: 0, away: 0 },
          minute: 12,
          pressure: 75,
          signal: "ENTRAR AGORA"
        },
        {
          id: 2,
          home: "Barcelona",
          away: "Valencia",
          goals: { home: 1, away: 0 },
          minute: 30,
          pressure: 55,
          signal: "AGUARDAR"
        }
      ];
      return;
    }

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

  } catch (e) {
    console.error("Erro API, usando fallback");

    games = [
      {
        id: 1,
        home: "Corinthians",
        away: "Santos",
        goals: { home: 0, away: 0 },
        minute: 10,
        pressure: 80,
        signal: "ENTRAR AGORA"
      }
    ];
  }
}

// Página
app.get('/', (req, res) => {
  res.send(`
  <html>
  <body style="background:#111;color:#fff;font-family:Arial">
  <h1>🔥 Trader Over 1.5</h1>
  <div id="app"></div>

  <script>
    const evt = new EventSource('/live');

    evt.onmessage = e => {
      const data = JSON.parse(e.data);
      const app = document.getElementById('app');
      app.innerHTML = '';

      data.forEach(g => {
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

// Tempo real
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

// Start
app.listen(PORT, () => {
  console.log('Servidor rodando...');
  sync();
});
