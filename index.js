import express from 'express';
import fetch from 'node-fetch';
import cors from 'cors';
import path from 'path';

const app = express();
app.use(cors());
app.use(express.static('public'));

const PORT = process.env.PORT || 10000;

// Rota principal (carrega o layout bonito)
app.get('/', (req, res) => {
  res.sendFile(path.resolve('public/index.html'));
});

// Dados fake (depois vamos colocar API real)
app.get('/games', (req, res) => {
  const games = [
    {
      home: "Flamengo",
      away: "Palmeiras",
      minute: 12,
      goals: "0-0",
      pressure: 78,
      odds: 1.35,
      signal: "🔥 ENTRAR AGORA"
    },
    {
      home: "Barcelona",
      away: "Valencia",
      minute: 30,
      goals: "1-0",
      pressure: 55,
      odds: 1.28,
      signal: "⏳ AGUARDAR"
    },
    {
      home: "Real Madrid",
      away: "Sevilla",
      minute: 18,
      goals: "0-0",
      pressure: 82,
      odds: 1.40,
      signal: "🔥 ENTRAR AGORA"
    }
  ];

  res.json(games);
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log('🔥 SERVIDOR RODANDO...');
});
