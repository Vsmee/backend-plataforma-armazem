const db = require('../db');

// 🔹 Listar todos os layouts
const listarLayouts = async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM layouts WHERE usuario_id = $1 ORDER BY criado_em DESC',
      [req.usuario.id]
    );
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Erro ao listar layouts:', error);
    res.status(500).send('Erro interno');
  }
};

// 🔹 Buscar layout por ID
const buscarLayoutPorId = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query(
      'SELECT * FROM layouts WHERE id = $1 AND usuario_id = $2',
      [id, req.usuario.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).send('Layout não encontrado');
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao buscar layout:', error);
    res.status(500).send('Erro interno');
  }
};

// 🔹 Criar novo layout
const criarLayout = async (req, res) => {
  const { nome, arquivo } = req.body;

  if (!nome) {
    return res.status(400).send('Nome do layout é obrigatório');
  }

  try {
    const result = await db.query(
      'INSERT INTO layouts (nome, arquivo, usuario_id) VALUES ($1, $2, $3) RETURNING *',
      [nome, arquivo || null, req.usuario.id]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao criar layout:', error);
    res.status(500).send('Erro interno');
  }
};

// 🔹 Atualizar layout
const atualizarLayout = async (req, res) => {
  const { id } = req.params;
  const { nome, arquivo } = req.body;

  try {
    const result = await db.query(
      'UPDATE layouts SET nome = $1, arquivo = $2 WHERE id = $3 AND usuario_id = $4 RETURNING *',
      [nome, arquivo, id, req.usuario.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).send('Layout não encontrado ou sem permissão');
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao atualizar layout:', error);
    res.status(500).send('Erro interno');
  }
};

// 🔹 Deletar layout
const deletarLayout = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await db.query(
      'DELETE FROM layouts WHERE id = $1 AND usuario_id = $2 RETURNING *',
      [id, req.usuario.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).send('Layout não encontrado ou sem permissão');
    }

    res.status(200).send('Layout deletado com sucesso');
  } catch (error) {
    console.error('Erro ao deletar layout:', error);
    res.status(500).send('Erro interno');
  }
};

module.exports = {
  listarLayouts,
  buscarLayoutPorId,
  criarLayout,
  atualizarLayout,
  deletarLayout
};

