const db = require('../db');

// Listar relatórios por layout
const listarRelatorios = async (req, res) => {
  const { layout_id } = req.query;

  if (!layout_id) return res.status(400).send('layout_id é obrigatório');

  try {
    const result = await db.query(
      'SELECT * FROM relatorios WHERE layout_id = $1 ORDER BY gerado_em DESC',
      [layout_id]
    );
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Erro ao listar relatórios:', error);
    res.status(500).send('Erro interno');
  }
};

// Buscar por ID
const buscarRelatorioPorId = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await db.query('SELECT * FROM relatorios WHERE id = $1', [id]);
    if (result.rows.length === 0) return res.status(404).send('Relatório não encontrado');
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao buscar relatório:', error);
    res.status(500).send('Erro interno');
  }
};

// Criar relatório
const criarRelatorio = async (req, res) => {
  const { tipo, filtros_json, resultado, layout_id } = req.body;

  if (!tipo || !layout_id) return res.status(400).send('tipo e layout_id são obrigatórios');

  try {
    const result = await db.query(
      'INSERT INTO relatorios (tipo, filtros_json, resultado, layout_id) VALUES ($1, $2, $3, $4) RETURNING *',
      [tipo, filtros_json || null, resultado || null, layout_id]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao criar relatório:', error);
    res.status(500).send('Erro interno');
  }
};

// Deletar relatório
const deletarRelatorio = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await db.query('DELETE FROM relatorios WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) return res.status(404).send('Relatório não encontrado');
    res.status(200).send('Relatório deletado com sucesso');
  } catch (error) {
    console.error('Erro ao deletar relatório:', error);
    res.status(500).send('Erro interno');
  }
};

module.exports = {
  listarRelatorios,
  buscarRelatorioPorId,
  criarRelatorio,
  deletarRelatorio
};
