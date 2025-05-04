const db = require('../db');

// Listar predios

const listarPredios = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT
        predios.id,
        predios.nome,
        predios.codigo,
        predios.deposito_id,
        depositos.nome AS nome_deposito
      FROM predios
      JOIN depositos ON predios.deposito_id = depositos.id
      ORDER BY depositos.nome, predios.nome;
    `);

    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Erro ao listar prédios com depósitos:', error);
    res.status(500).send('Erro ao buscar prédios.');
  }
};

module.exports = {
  listarPredios
};


// Listar prédios de um depósito
const listarPorDeposito = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await db.query(`
      SELECT 
        p.id, p.nome, p.codigo, p.deposito_id,
        COALESCE(
          json_agg(json_build_object('x', pp.x, 'y', pp.y)) 
          FILTER (WHERE pp.id IS NOT NULL), '[]'
        ) AS posicoes
      FROM predios p
      LEFT JOIN predio_posicoes pp ON p.id = pp.predio_id
      WHERE p.deposito_id = $1
      GROUP BY p.id
    `, [id]);

    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Erro ao listar prédios por depósito:', error);
    res.status(500).send('Erro interno ao buscar prédios');
  }
};


// Listar prédios de uma rua
const listarPorRua = async (req, res) => {
  const { rua_id } = req.params;
  try {
    const result = await db.query(
      'SELECT * FROM predios WHERE rua_id = $1',
      [rua_id]
    );
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Erro ao listar por rua:', error);
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
  const { nome, codigo, rua_id, deposito_id, x, y } = req.body;

  if (!nome || !codigo || !deposito_id) {
    return res.status(400).send('nome, codigo e deposito_id são obrigatórios');
  }

  try {
    const result = await db.query(
      'INSERT INTO predios (nome, codigo, rua_id, deposito_id, x, y) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [nome, codigo, rua_id || null, deposito_id, x || 0, y || 0]
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
  const { nome, codigo, x, y } = req.body;

  try {
    const result = await db.query(
      'UPDATE predios SET nome = $1, codigo = $2, x = $3, y = $4 WHERE id = $5 RETURNING *',
      [nome, codigo, x, y, id]
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
  listarPorRua,
  listarPorDeposito,
  buscarPredioPorId,
  criarPredio,
  atualizarPredio,
  deletarPredio
};
