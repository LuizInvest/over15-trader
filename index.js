import express from 'express';
import path from 'path';

const app = express();
const PORT = process.env.PORT || 3000;

// servir frontend
app.use(express.static('public'));

app.get('/', (req, res) => {
  res.sendFile(path.join(process.cwd(), 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log('🔥 OVER 1.5 ANALYZER PRO ONLINE');
});
