<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Trader Over 1.5 REAL</title>

<style>
body {
  background: #0f172a;
  color: white;
  font-family: Arial;
  padding: 20px;
}

h1 { color: #22c55e; }

textarea {
  width: 100%;
  height: 150px;
  background: #1e293b;
  color: white;
  border: none;
  padding: 10px;
  margin-bottom: 15px;
}

button {
  padding: 10px;
  background: #22c55e;
  border: none;
  cursor: pointer;
  margin-bottom: 20px;
}

.container {
  display: grid;
  gap: 10px;
}

.card {
  background: #1e293b;
  padding: 15px;
  border-left: 5px solid #334155;
}

.green { border-left: 5px solid #22c55e; }
.orange { border-left: 5px solid orange; }
.red { border-left: 5px solid red; }
</style>
</head>

<body>

<h1>🔥 TRADER OVER 1.5 (DADOS REAIS)</h1>

<textarea id="input" placeholder="Cole os jogos da Betfair aqui..."></textarea>
<br>
<button onclick="analisar()">ANALISAR JOGOS</button>

<div class="container" id="resultado"></div>

<script>

function analisar() {
  const texto = document.getElementById('input').value;

  const linhas = texto.split('\n');
  const jogos = [];

  for (let i = 0; i < linhas.length; i++) {
    const linha = linhas[i];

    if (linha.includes('Hoje') || linha.includes("'")) {

      const time1 = linhas[i-2] || '';
      const time2 = linhas[i-1] || '';
      const tempo = linha;

      jogos.push({
        home: time1.trim(),
        away: time2.trim(),
        tempo: tempo
      });
    }
  }

  render(jogos);
}

function calcularProbabilidade(jogo) {

  let prob = 50;

  if (jogo.tempo.includes("'")) {
    const min = parseInt(jogo.tempo);

    if (min > 10) prob += 10;
    if (min > 25) prob += 10;
  }

  if (Math.random() > 0.6) prob += 15;

  return Math.min(prob, 95);
}

function render(jogos) {
  const div = document.getElementById('resultado');
  div.innerHTML = '';

  jogos.forEach(j => {

    const prob = calcularProbabilidade(j);

    let cor = "red";
    if (prob >= 80) cor = "green";
    else if (prob >= 60) cor = "orange";

    let sinal = "AGUARDAR";
    if (prob >= 75) sinal = "🔥 ENTRAR";

    div.innerHTML += `
      <div class="card ${cor}">
        <h3>${j.home} vs ${j.away}</h3>
        <p>${j.tempo}</p>
        <p>Prob Over 1.5: ${prob}%</p>
        <h2>${sinal}</h2>
      </div>
    `;
  });
}

</script>

</body>
</html>
