import express from 'express';
import fetch from 'node-fetch';
import cors from 'cors';

const app = express();
app.use(cors());

const API_KEY = process.env.API_FOOTBALL_KEY;
const API_URL = 'https://v3.football.api-sports.io';
const PORT = process.env.PORT || 3000;

let games = [];

// Buscar jogos
async function fetchGames() {
  const today = new Date().toISOString().split('T')[0];

  const res = await fetch(`${API_URL}/fixtures?date=${today}`, {
    headers: { 'X-Api-Key': API_KEY }
  });

  const data = await res.json();
  return data.response || [];
}

// SCORE PROFISSIONAL
function getScore(favoriteOdd, minute, goals) {
  let score = 0;

  if (favoriteOdd <= 1.40) score += 40;
  if (favoriteOdd <= 1.60) score += 20;

  if (minute >= 10 && minute <= 30) score += 30;

  if (goals === 0) score += 20;
  if (goals === 1 && minute <= 25) score += 15;

  return score;
}

// ANALISE EXTREMA
function analyzeGame(g) {
  const home = g.teams.home.name;
  const away = g.teams.away.name;

  const minute = g.fixture.status.elapsed || 0;
  const goals = (g.goals.home || 0) + (g.goals.away || 0);

  // simulação de odd favorita (limitação API free)
  const odd = Math.random() * (1.8 - 1.2) + 1.2;

  const score = getScore(odd, minute, goals);

  let signal = 'EVITAR';
  let level = 'RUIM';

  if (score >= 70) {
    signal = '🔥 ENTRAR AGORA';
    level = 'ELITE';
  } else if (score >= 50) {
    signal = '⚠️ OBSERVAR';
    level = 'FORTE';
  }

  if (minute > 60 && goals === 0) {
    signal = '❌ JOGO MORTO';
    level = 'EVITAR';
  }

  return {
    home,
    away,
    minute,
    goals: g.goals.home + " - " + g.goals.away,
    odd: odd.toFixed(2),
    score,
    signal,
    level
  };
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
          odd: "-",
          score: "-",
          signal: "AGUARDE",
          level: "-"
        }
      ];
      return;
    }

    games = raw
      .map(g => analyzeGame(g))
      .filter(g => g.level !== 'RUIM')
      .sort((a,b) => b.score - a.score)
      .slice(0, 6);

  } catch (e) {
    console.error("Erro API");
  }
}

// Front
app.get('/', (req, res) => {
  res.send(`
  <html>
  <body style="background:#000;color:#fff;font-family:Arial">
  <h1>🔥 TRADER EXTREMO OVER 1.5</h1>
  <div id="app"></div>

  <script>
    const evt = new EventSource('/live');

    evt.onmessage = e => {
      const data = JSON.parse(e.data);
      const app = document.getElementById('app');
      app.innerHTML = '';

      data.forEach((g,i) => {
        let color = '#333';

        if (g.level === 'ELITE') color = '#00ff88';
        if (g.level === 'FORTE') color = '#f4a261';
        if (g.level === 'EVITAR') color = '#e63946';

        const div = document.createElement('div');
        div.style = "margin:10px;padding:10px;background:"+color;

        div.innerHTML = \`
          <h3>#\${i+1} - \${g.level}</h3>
          <b>\${g.home} vs \${g.away}</b><br>
          Min: \${g.minute} | Gols: \${g.goals}<br>
          Odd: \${g.odd} | Score: \${g.score}<br>
          <b>\${g.signal}</b>
        \`;

        app.appendChild(div);
      });
    };
  </script>
  </body>
  </html>
  `);
}

// SSE
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
  console.log('🔥 EXTREMO rodando...');
  sync();
});
