import express from 'express';
import fetch from 'node-fetch';
import cors from 'cors';
import path from 'path';

const app = express();
app.use(cors());

const PORT = process.env.PORT || 3000;

// SERVIR FRONT
app.use(express.static('public'));

app.get('/', (req, res) => {
  res.sendFile(path.resolve('public/index.html'));
});

// DADOS FAKE (TESTE)
app.get('/games', (req, res) => {
  const games = [
    {
      home: "Flamengo",
      away: "Palmeiras",
      minute: 12,
      goals: "0-0",
      pressure: 75,
      odds: 1.35,
      signal: "🔥 ENTRAR AGORA"
    },
    {
      home: "Barcelona",
      away: "Valencia",
      minute: 30,
      goals: "1-0",
      pressure: 55,
      odds: 1.25,
      signal: "⏳ AGUARDAR"
    }
  ];

  res.json(games);
});

// START
app.listen(PORT, () => {
  console.log("🔥 SERVIDOR RODANDO...");
});
