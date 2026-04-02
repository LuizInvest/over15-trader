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

// TODOS JOGOS DO DIA (SEM FILTRO)
app.get('/games', async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    const response = await fetch(
      `https://v3.football.api-sports.io/fixtures?date=${today}`,
      {
        headers: { 'X-Api-Key': API_KEY }
      }
    );

    const data = await response.json();

    if (!data.response) return res.json([]);

    const games = data.response.map(g => {
      const minute = g.fixture.status.elapsed || 0;
      const homeGoals = g.goals.home ?? 0;
      const awayGoals = g.goals.away ?? 0;
      const totalGoals = homeGoals + awayGoals;

      // SIMULAÇÃO PROBABILIDADE OVER 1.5
      let probability = 50;

      if (minute > 10) probability += 10;
      if (minute > 20) probability += 10;
      if (totalGoals === 1) probability += 20;
      if (totalGoals >= 2) probability = 95;

      return {
        league: g.league.name,
        home: g.teams.home.name,
        away: g.teams.away.name,
        status: g.fixture.status.short,
        minute: minute,
        time: new Date(g.fixture.date).toLocaleTimeString(),
        goals: `${homeGoals} - ${awayGoals}`,
        probability: probability
      };
    });

    res.json(games);

  } catch (error) {
    console.log(error);
    res.json([]);
  }
});

app.listen(PORT, () => {
  console.log('🔥 SERVIDOR RODANDO...');
});
