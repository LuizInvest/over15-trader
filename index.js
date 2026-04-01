import express from 'express';
import fetch from 'node-fetch';
import cors from 'cors';

const app = express();
app.use(cors());

const API_KEY = process.env.API_FOOTBALL_KEY;
const API_URL = 'https://v3.football.api-sports.io';
const PORT = process.env.PORT || 3000;

let games = [];

// Buscar jogos ao vivo
async function fetchGames() {
  const res = await fetch(`${API_URL}/fixtures?live=all`, {
    headers: { 'X-Api-Key': API_KEY }
  });

  const data = await res.json();
  return data.response || [];
}

// LÓGICA PROFISSIONAL
function analyze(g) {
  const minute = g.fixture.status.elapsed || 0;
  const goals = (g.goals.home || 0) + (g.goals.away || 0);

  let signal = 'NÃO ENTRAR';
  let level = 'RUIM';

  // FILTRO PROFISSIONAL OVER 1.5
  if (goals === 0 && minute >= 10 && minute <= 35) {
    signal = 'ENTRAR AGORA';
    level = 'ELITE';
  }

  if (goals === 1 && minute <= 30) {
    signal = 'OVER 2.5 POSSÍVEL';
    level = 'FORTE';
  }

  if (minute > 60 && goals === 0) {
    signal = 'PERIGO TOTAL';
    level = 'EVITAR';
  }

  return { minute, goals, signal, level };
}

// Sync
async function sync() {
  try {
    const raw = await fetchGames();

    if (!raw.length) {
      games = [
        {
          home: "Sem jogos bons agora",
          away: "",
          minute: "-",
          goals: "-",
          signal: "AGUARDE",
          level: "-"
        }
      ];
      return;
    }

    games = raw.map(g => {
      const a = analyze(g);

      return {
        home: g.teams.home.name,
        away: g.teams.away.name,
        minute: a.minute,
        goals: (g.goals.home || 0) + " - " + (g.goals.away || 0),
        signal: a.signal,
        level: a.level
      };
    }).slice(0, 6);

  } catch (e) {
    console.error("Erro API");
  }
}

// Front
app.get('/', (req, res) => {
  res.send(`
  <html>
  <body style="background:#000;color:#fff;font-family:Arial">
  <h1>🔥 Trader PRO Over 1.5</h1>
  <div id="app"></div>

  <script>
    const evt = new EventSource('/live');

    evt.onmessage = e => {
      const data = JSON.parse(e.data);
      const app = document.getElementById('app');
      app.innerHTML = '';

      data.forEach(g => {
        let color = '#333';

        if (g.level === 'ELITE') color = '#00ff88';
        if (g.level === 'FORTE') color = '#f4a261';
        if (g.level === 'EVITAR') color = '#e63946';

        const div = document.createElement('div');
        div.style = "margin:10px;padding:10px;background:"+color;

        div.innerHTML = \`
          <b>\${g.home} vs \${g.away}</b><br>
          Min: \${g.minute} | Gols: \${g.goals}<br>
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

// Live
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

// Atualiza
setInterval(sync, 60000);

app.listen(PORT, () => {
  console.log('PRO rodando...');
  sync();
});
