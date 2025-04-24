const db = require('../db');

// Listar todos os depósitos
const listarDepositos = async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM depositos WHERE usuario_id = $1 ORDER BY criado_em DESC',
      [req.usuario.id]
    );
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Erro ao listar depósitos:', error);
    res.status(500).send('Erro interno');
  }
};

// Buscar depósito por ID
const buscarDepositoPorId = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query(
      'SELECT * FROM depositos WHERE id = $1 AND usuario_id = $2',
      [id, req.usuario.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).send('Depósito não encontrado');
    }
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao buscar depósito:', error);
    res.status(500).send('Erro interno');
  }
};

// Criar novo depósito
const criarDeposito = async (req, res) => {
  const { nome, arquivo } = req.body;

  if (!nome) {
    return res.status(400).send('Nome do depósito é obrigatório');
  }

  try {
    const result = await db.query(
      'INSERT INTO depositos (nome, arquivo, usuario_id) VALUES ($1, $2, $3) RETURNING *',
      [nome, arquivo || null, req.usuario.id]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao criar depósito:', error);
    res.status(500).send('Erro interno');
  }
};

// Atualizar depósito
const atualizarDeposito = async (req, res) => {
  const { id } = req.params;
  const { nome, arquivo } = req.body;

  try {
    const result = await db.query(
      'UPDATE depositos SET nome = $1, arquivo = $2 WHERE id = $3 AND usuario_id = $4 RETURNING *',
      [nome, arquivo, id, req.usuario.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).send('Depósito não encontrado ou sem permissão');
    }
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao atualizar depósito:', error);
    res.status(500).send('Erro interno');
  }
};

// Deletar depósito
const deletarDeposito = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await db.query(
      'DELETE FROM depositos WHERE id = $1 AND usuario_id = $2 RETURNING *',
      [id, req.usuario.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).send('Depósito não encontrado ou sem permissão');
    }
    res.status(200).send('Depósito deletado com sucesso');
  } catch (error) {
    console.error('Erro ao deletar depósito:', error);
    res.status(500).send('Erro interno');
  }
};

module.exports = {
  listarDepositos,
  buscarDepositoPorId,
  criarDeposito,
  atualizarDeposito,
  deletarDeposito,
};
