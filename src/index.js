const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const rotas = require('./routes');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/api', rotas);

app.get('/', (req, res) => {
  res.send('API da Plataforma de Armazém funcionando!');
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});


