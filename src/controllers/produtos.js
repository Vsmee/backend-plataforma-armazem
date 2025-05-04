const db = require('../db');




const listarProdutos = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT
        produtos.id,
        produtos.nome,
        produtos.codigo,
        produtos.quantidade,
        produtos.apartamento_id,
        produtos.criado_em,
        apartamentos.nome AS nome_apartamento,
        apartamentos.andar_id
      FROM produtos
      JOIN apartamentos ON produtos.apartamento_id = apartamentos.id
      ORDER BY apartamentos.nome, produtos.nome;
    `);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Erro ao listar produtos:', error);
    res.status(500).send('Erro ao buscar produtos.');
  }
};


// Listar produtos por apartamento
const listarPorApartamento = async (req, res) => {
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
  const { nome, codigo, quantidade, apartamento_id } = req.body;

  if (!nome || !quantidade || !apartamento_id) {
    return res.status(400).send('nome, quantidade e apartamento_id são obrigatórios');
  }

  try {
    const result = await db.query(
      'INSERT INTO produtos (nome, codigo, quantidade, apartamento_id) VALUES ($1, $2, $3, $4) RETURNING *',
      [nome, codigo || null, quantidade, apartamento_id]
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
  const { nome, codigo, quantidade, apartamento_id } = req.body;

  try {
    const result = await db.query(
      'UPDATE produtos SET nome = $1, codigo = $2, quantidade = $3, apartamento_id = $4 WHERE id = $5 RETURNING *',
      [nome, codigo || null, quantidade, apartamento_id, id]
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
  listarPorApartamento,
  listarProdutos,
  buscarProdutoPorId,
  criarProduto,
  atualizarProduto,
  deletarProduto
};
