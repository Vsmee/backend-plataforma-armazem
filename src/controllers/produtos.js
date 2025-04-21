const db = require('../db');

// Listar produtos por apartamento
const listarProdutos = async (req, res) => {
  const { apartamento_id } = req.query;

  if (!apartamento_id) return res.status(400).send('apartamento_id é obrigatório');

  try {
    const result = await db.query(
      'SELECT * FROM produtos WHERE apartamento_id = $1',
      [apartamento_id]
    );
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Erro ao listar produtos:', error);
    res.status(500).send('Erro interno');
  }
};

// Buscar produto por ID
const buscarProdutoPorId = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query('SELECT * FROM produtos WHERE id = $1', [id]);
    if (result.rows.length === 0) return res.status(404).send('Produto não encontrado');
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao buscar produto:', error);
    res.status(500).send('Erro interno');
  }
};

// Criar produto
const criarProduto = async (req, res) => {
  const { nome, quantidade, data_validade, apartamento_id } = req.body;

  if (!nome || !quantidade || !apartamento_id) {
    return res.status(400).send('nome, quantidade e apartamento_id são obrigatórios');
  }

  try {
    const result = await db.query(
      'INSERT INTO produtos (nome, quantidade, data_validade, apartamento_id) VALUES ($1, $2, $3, $4) RETURNING *',
      [nome, quantidade, data_validade || null, apartamento_id]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao criar produto:', error);
    res.status(500).send('Erro interno');
  }
};

// Atualizar produto
const atualizarProduto = async (req, res) => {
  const { id } = req.params;
  const { nome, quantidade, data_validade } = req.body;

  try {
    const result = await db.query(
      'UPDATE produtos SET nome = $1, quantidade = $2, data_validade = $3 WHERE id = $4 RETURNING *',
      [nome, quantidade, data_validade, id]
    );
    if (result.rows.length === 0) return res.status(404).send('Produto não encontrado');
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao atualizar produto:', error);
    res.status(500).send('Erro interno');
  }
};

// Deletar produto
const deletarProduto = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await db.query('DELETE FROM produtos WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) return res.status(404).send('Produto não encontrado');
    res.status(200).send('Produto deletado com sucesso');
  } catch (error) {
    console.error('Erro ao deletar produto:', error);
    res.status(500).send('Erro interno');
  }
};

module.exports = {
  listarProdutos,
  buscarProdutoPorId,
  criarProduto,
  atualizarProduto,
  deletarProduto
};
