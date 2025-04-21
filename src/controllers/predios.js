const db = require('../db');

// Listar prédios de uma rua
const listarPredios = async (req, res) => {
  const { rua_id } = req.query;

  if (!rua_id) return res.status(400).send('rua_id é obrigatório');

  try {
    const result = await db.query(
      'SELECT * FROM predios WHERE rua_id = $1',
      [rua_id]
    );
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Erro ao listar prédios:', error);
    res.status(500).send('Erro interno');
  }
};

// Buscar prédio por ID
const buscarPredioPorId = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query('SELECT * FROM predios WHERE id = $1', [id]);
    if (result.rows.length === 0) return res.status(404).send('Prédio não encontrado');
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao buscar prédio:', error);
    res.status(500).send('Erro interno');
  }
};

// Criar prédio
const criarPredio = async (req, res) => {
  const { nome, rua_id, posicao_x, posicao_y } = req.body;

  if (!nome || !rua_id) return res.status(400).send('nome e rua_id são obrigatórios');

  try {
    const result = await db.query(
      'INSERT INTO predios (nome, rua_id, posicao_x, posicao_y) VALUES ($1, $2, $3, $4) RETURNING *',
      [nome, rua_id, posicao_x || 0, posicao_y || 0]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao criar prédio:', error);
    res.status(500).send('Erro interno');
  }
};

// Atualizar prédio
const atualizarPredio = async (req, res) => {
  const { id } = req.params;
  const { nome, posicao_x, posicao_y } = req.body;

  try {
    const result = await db.query(
      'UPDATE predios SET nome = $1, posicao_x = $2, posicao_y = $3 WHERE id = $4 RETURNING *',
      [nome, posicao_x, posicao_y, id]
    );
    if (result.rows.length === 0) return res.status(404).send('Prédio não encontrado');
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao atualizar prédio:', error);
    res.status(500).send('Erro interno');
  }
};

// Deletar prédio
const deletarPredio = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query('DELETE FROM predios WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) return res.status(404).send('Prédio não encontrado');
    res.status(200).send('Prédio deletado com sucesso');
  } catch (error) {
    console.error('Erro ao deletar prédio:', error);
    res.status(500).send('Erro interno');
  }
};

module.exports = {
  listarPredios,
  buscarPredioPorId,
  criarPredio,
  atualizarPredio,
  deletarPredio
};
