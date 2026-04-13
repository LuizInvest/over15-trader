import express from 'express';
import fetch from 'node-fetch';
import cors from 'cors';
import path from 'path';

const app = express();
app.use(cors());

const PORT = process.env.PORT || 3000;
const API_KEY = process.env.API_FOOTBALL_KEY;

app.use(express.static('public'));

app.get('/', (req, res) => {
  res.sendFile(path.join(process.cwd(), 'public', 'index.html'));
});

// 🔥 BUSCAR + FILTRAR JOGOS FUTUROS
app.get('/games', async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    const response = await fetch(
      `https://v3.football.api-sports.io/fixtures?date=${today}`,
      { headers: { 'X-Api-Key': API_KEY } }
    );

    const data = await response.json();

    if (!data.response) return res.json([]);

    const futuros = data.response.filter(g =>
      g.fixture.status.short === "NS" // não iniciado
    );

    const jogos = futuros.map(g => {

      const oddHome = 1.20 + Math.random() * 0.15; // simula odds seguras

      return {
        league: g.league.name,
        home: g.teams.home.name,
        away: g.teams.away.name,
        time: new Date(g.fixture.date).toLocaleTimeString(),
        odd: oddHome.toFixed(2)
      };
    });

    // 🔥 pega TOP 4 favoritos (simples)
    const top4 = jogos.slice(0, 4);

    // 🔁 gera 2/4
    const multiplas = gerarMultiplas(top4);

    res.json({ jogos: top4, multiplas });

  } catch (err) {
    console.log(err);
    res.json({ jogos: [], multiplas: [] });
  }
});

// 🔁 SISTEMA 2/4
function gerarMultiplas(jogos) {
  const combos = [];

  for (let i = 0; i < jogos.length; i++) {
    for (let j = i + 1; j < jogos.length; j++) {

      const oddTotal = (jogos[i].odd * jogos[j].odd).toFixed(2);

      combos.push({
        jogos: [jogos[i], jogos[j]],
        oddTotal
      });

    }
  }

  return combos;
}

app.listen(PORT, () => {
  console.log('🔥 MULTIPLAS 2/4 ATIVAS');
});
