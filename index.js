import express from 'express';
import fetch from 'node-fetch';
import cors from 'cors';
import path from 'path';

const app = express();
app.use(cors());

const PORT = process.env.PORT || 3000;
const API_KEY = process.env.API_FOOTBALL_KEY;

// FRONT
app.use(express.static('public'));

app.get('/', (req, res) => {
  res.sendFile(path.join(process.cwd(), 'public', 'index.html'));
});

// 🔥 FUNÇÃO COM FALLBACK (GARANTE DADOS)
async function fetchGames() {
  const today = new Date().toISOString().split('T')[0];

  const urls = [
    `https://v3.football.api-sports.io/fixtures?date=${today}`,
    `https://v3.football.api-sports.io/fixtures?season=2024&date=${today}`,
    `https://v3.football.api-sports.io/fixtures?league=39&season=2024`
  ];

  for (let url of urls) {
    try {
      const res = await fetch(url, {
        headers: { 'X-Api-Key': API_KEY }
      });

      const data = await res.json();

      if (data.response && data.response.length > 0) {
        return data.response;
      }

    } catch (err) {
      console.log('Erro tentativa:', err);
    }
  }

  return [];
}

// API
app.get('/games', async (req, res) => {
  try {
    const rawGames = await fetchGames();

    // 🔥 SE NÃO VIER NADA → MOSTRA ERRO
    if (!rawGames.length) {
      return res.json([
        { erro: "SEM DADOS DA API - VERIFIQUE SUA CHAVE" }
      ]);
    }

    const games = rawGames.map(g => {
      const minute = g.fixture.status.elapsed || 0;
      const homeGoals = g.goals.home ?? 0;
      const awayGoals = g.goals.away ?? 0;
      const totalGoals = homeGoals + awayGoals;

      let probability = 50;

      if (minute > 10) probability += 10;
      if (minute > 20) probability += 10;
      if (totalGoals === 1) probability += 20;
      if (totalGoals >= 2) probability = 95;

      return {
        league: g.league.name,
        home: g.teams.home.name,
        away: g.teams.away.name,
        minute,
        status: g.fixture.status.short,
        time: new Date(g.fixture.date).toLocaleTimeString(),
        goals: `${homeGoals} - ${awayGoals}`,
        probability
      };
    });

    res.json(games);

  } catch (error) {
    console.log(error);
    res.json([{ erro: "ERRO NA API" }]);
  }
});

app.listen(PORT, () => {
  console.log('🔥 SERVIDOR RODANDO...');
});
