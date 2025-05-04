const db = require('../db');

// Listar todas as ruas

const listarRuas = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT
        ruas.id,
        ruas.nome,
        ruas.codigo,
        ruas.deposito_id,
        depositos.nome AS nome_deposito
      FROM ruas
      JOIN depositos ON ruas.deposito_id = depositos.id
      ORDER BY depositos.nome, ruas.nome;
    `);

    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Erro ao listar ruas com nome de depósitos:', error);
    res.status(500).send('Erro ao buscar ruas.');
  }
};



// Listar todas as ruas de um depósito
const listarPorDeposito = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await db.query(`
      SELECT 
        r.id, r.nome, r.codigo, r.deposito_id,
        COALESCE(
          json_agg(json_build_object('x', rp.x, 'y', rp.y)) 
          FILTER (WHERE rp.id IS NOT NULL), '[]'
        ) AS posicoes
      FROM ruas r
      LEFT JOIN rua_posicoes rp ON r.id = rp.rua_id
      WHERE r.deposito_id = $1
      GROUP BY r.id
    `, [id]);

    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Erro ao listar ruas por depósito:', error);
    res.status(500).send('Erro interno ao buscar ruas');
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
  const { nome, ordem, deposito_id } = req.body;
  try {
    const result = await db.query(
      'INSERT INTO ruas (nome, ordem, deposito_id) VALUES ($1, $2, $3) RETURNING *',
      [nome, ordem, deposito_id]
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
  listarPorDeposito,
  buscarRuaPorId,
  criarRua,
  atualizarRua,
  deletarRua
};
