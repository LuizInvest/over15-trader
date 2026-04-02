<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Trader Over 1.5 PRO</title>

<style>
body { background:#0f172a; color:white; font-family:Arial; padding:20px; }
h1 { color:#22c55e; }

.container { display:grid; gap:10px; }

.card {
  background:#1e293b;
  padding:15px;
  border-left:5px solid #334155;
}

.green { border-left:5px solid #22c55e; }
.orange { border-left:5px solid orange; }
.red { border-left:5px solid red; }

.top { border:2px solid gold; }

textarea {
  width:100%;
  height:120px;
  margin-bottom:10px;
  background:#1e293b;
  color:white;
  border:none;
  padding:10px;
}

button {
  padding:10px;
  background:#22c55e;
  border:none;
  cursor:pointer;
  margin-bottom:20px;
}
</style>
</head>

<body>

<h1>🔥 TRADER OVER 1.5 PRO</h1>

<textarea id="input" placeholder="Cole os jogos (ex: Flamengo x Palmeiras 12' 0-0 odd 1.35)"></textarea>
<button onclick="analisar()">ANALISAR</button>

<h2>🏆 TOP 3 ENTRADAS</h2>
<div id="top"></div>

<h2>📊 TODOS OS JOGOS</h2>
<div class="container" id="lista"></div>

<script>

function analisar() {
  const texto = document.getElementById('input').value;

  const linhas = texto.split('\n');
  let jogos = [];

  linhas.forEach(l => {

    const match = l.match(/(.+)\s+x\s+(.+)\s+(\d+)'?\s+(\d+)-(\d+)\s+odd\s+([\d.]+)/i);

    if (match) {
      jogos.push({
        home: match[1],
        away: match[2],
        minute: parseInt(match[3]),
        homeGoals: parseInt(match[4]),
        awayGoals: parseInt(match[5]),
        odd: parseFloat(match[6])
      });
    }

  });

  jogos = jogos.map(j => analisarJogo(j));

  jogos.sort((a,b)=>b.score-a.score);

  renderTop(jogos.slice(0,3));
  renderLista(jogos);
}

// 🔥 LÓGICA PROFISSIONAL
function analisarJogo(j) {

  let score = 0;

  const total = j.homeGoals + j.awayGoals;

  if (j.minute >= 10 && j.minute <= 30) score += 25;
  if (total === 0) score += 25;
  if (total === 1) score += 15;
  if (j.odd <= 1.50) score += 15;
  if (j.minute >= 20) score += 10;

  let sinal = "AGUARDAR";

  if (score >= 60) sinal = "🔥 ENTRAR";

  return { ...j, score, sinal };
}

function renderTop(jogos) {
  const div = document.getElementById('top');
  div.innerHTML = '';

  jogos.forEach(j => {
    div.innerHTML += `
      <div class="card green top">
        <h3>${j.home} vs ${j.away}</h3>
        <p>${j.minute}' | ${j.homeGoals}-${j.awayGoals}</p>
        <p>Odd: ${j.odd}</p>
        <h2>${j.sinal}</h2>
      </div>
    `;
  });
}

function renderLista(jogos) {
  const div = document.getElementById('lista');
  div.innerHTML = '';

  jogos.forEach(j => {

    let cor = "red";
    if (j.score >= 60) cor = "green";
    else if (j.score >= 40) cor = "orange";

    div.innerHTML += `
      <div class="card ${cor}">
        <h3>${j.home} vs ${j.away}</h3>
        <p>${j.minute}' | ${j.homeGoals}-${j.awayGoals}</p>
        <p>Odd: ${j.odd}</p>
        <p>Score: ${j.score}</p>
        <h2>${j.sinal}</h2>
      </div>
    `;
  });
}

</script>

</body>
</html>
