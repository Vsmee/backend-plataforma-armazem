const db = require('../db');

// Listar todas as ruas de um layout
const listarRuas = async (req, res) => {
  const layoutId = req.query.layout_id;

  if (!layoutId) {
    return res.status(400).send('O parâmetro layout_id é obrigatório');
  }

  try {
    const result = await db.query('SELECT * FROM ruas WHERE layout_id = $1', [layoutId]);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Erro ao listar ruas:', error);
    res.status(500).send('Erro interno');
  }
};


// Buscar rua por ID
const buscarRuaPorId = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query('SELECT * FROM ruas WHERE id = $1', [id]);
    if (result.rows.length === 0) return res.status(404).send('Rua não encontrada');
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao buscar rua:', error);
    res.status(500).send('Erro interno');
  }
};

// Criar rua
const criarRua = async (req, res) => {
  const { nome, ordem, layout_id } = req.body;
  try {
    const result = await db.query(
      'INSERT INTO ruas (nome, ordem, layout_id) VALUES ($1, $2, $3) RETURNING *',
      [nome, ordem, layout_id]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao criar rua:', error);
    res.status(500).send('Erro interno');
  }
};

// Atualizar rua
const atualizarRua = async (req, res) => {
  const { id } = req.params;
  const { nome, ordem } = req.body;
  try {
    const result = await db.query(
      'UPDATE ruas SET nome = $1, ordem = $2 WHERE id = $3 RETURNING *',
      [nome, ordem, id]
    );
    if (result.rows.length === 0) return res.status(404).send('Rua não encontrada');
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao atualizar rua:', error);
    res.status(500).send('Erro interno');
  }
};

// Deletar rua
const deletarRua = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query('DELETE FROM ruas WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) return res.status(404).send('Rua não encontrada');
    res.status(200).send('Rua deletada com sucesso');
  } catch (error) {
    console.error('Erro ao deletar rua:', error);
    res.status(500).send('Erro interno');
  }
};

module.exports = {
  listarRuas,
  buscarRuaPorId,
  criarRua,
  atualizarRua,
  deletarRua
};
