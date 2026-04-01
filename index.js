import express from 'express';
import fetch from 'node-fetch';
import cors from 'cors';
import path from 'path';

const app = express();
app.use(cors());

const PORT = process.env.PORT || 3000;
const API_KEY = process.env.API_FOOTBALL_KEY;

// =============================
// SERVIR FRONTEND
// =============================
app.use(express.static('public'));

app.get('/', (req, res) => {
  res.sendFile(path.join(process.cwd(), 'public', 'index.html'));
});

// =============================
// BUSCAR JOGOS (AO VIVO + HOJE)
// =============================
app.get('/games', async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    const response = await fetch(
      `https://v3.football.api-sports.io/fixtures?date=${today}`,
      {
        headers: {
          'X-Api-Key': API_KEY
        }
      }
    );

    const data = await response.json();

    if (!data.response) return res.json([]);

    const games = data.response

      // 🔥 FILTRO: AO VIVO + NÃO INICIADOS
      .filter(g => {
        const status = g.fixture.status.short;

        return (
          status === "1H" ||
          status === "2H" ||
          status === "HT" ||
          status === "NS"
        );
      })

      .map(g => {
        const minute = g.fixture.status.elapsed || 0;
        const homeGoals = g.goals.home ?? 0;
        const awayGoals = g.goals.away ?? 0;
        const totalGoals = homeGoals + awayGoals;

        const pressure = Math.floor(Math.random() * 100);

        let signal = '⏳ AGUARDAR';

        // 🔥 AO VIVO
        if (minute >= 8 && minute <= 30 && totalGoals === 0 && pressure > 65) {
          signal = '🔥 ENTRAR AGORA';
        }

        // 🚀 PRÉ-JOGO
        if (minute === 0 && pressure > 70) {
          signal = '🚀 PRÉ-JOGO FORTE';
        }

        // ⚠️ RISCO
        if (minute > 35 && totalGoals === 0) {
          signal = '⚠️ RISCO';
        }

        return {
          home: g.teams.home.name,
          away: g.teams.away.name,
          minute: minute,
          time: new Date(g.fixture.date).toLocaleTimeString(),
          goals: `${homeGoals} - ${awayGoals}`,
          odds: (Math.random() * 0.4 + 1.20).toFixed(2),
          pressure: pressure,
          signal: signal
        };
      })

      .sort((a, b) => b.pressure - a.pressure)
      .slice(0, 10);

    res.json(games);

  } catch (error) {
    console.log('Erro API:', error);
    res.json([]);
  }
});

// =============================
// START SERVIDOR
// =============================
app.listen(PORT, () => {
  console.log('🔥 SERVIDOR RODANDO...');
});
