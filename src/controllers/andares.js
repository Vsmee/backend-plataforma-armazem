const db = require('../db');

const listarAndares = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT
        andares.id,
        andares.numero,
        predios.nome AS nome_predio,
        predios.deposito_id
      FROM andares
      JOIN predios ON andares.predio_id = predios.id
      ORDER BY predios.nome;
    `);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Erro ao listar andares:', error);
    res.status(500).send('Erro ao buscar andares.');
  }
};


// Listar andares por prédio
const listarPorPredio = async (req, res) => {
  const { predio_id } = req.query;

  if (!predio_id) return res.status(400).send('predio_id é obrigatório');

  try {
    const result = await db.query(
      'SELECT * FROM andares WHERE predio_id = $1',
      [predio_id]
    );
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Erro ao listar andares:', error);
    res.status(500).send('Erro interno');
  }
};

// Buscar por ID
const buscarAndarPorId = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query('SELECT * FROM andares WHERE id = $1', [id]);
    if (result.rows.length === 0) return res.status(404).send('Andar não encontrado');
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao buscar andar:', error);
    res.status(500).send('Erro interno');
  }
};

// Criar
const criarAndar = async (req, res) => {
  const { numero, predio_id } = req.body;

  if (!numero || !predio_id) {
    return res.status(400).send('numero e predio_id são obrigatórios');
  }

  try {
    const result = await db.query(
      'INSERT INTO andares (numero, predio_id) VALUES ($1, $2) RETURNING *',
      [numero, predio_id]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao criar andar:', error);
    res.status(500).send('Erro interno');
  }
};

// Atualizar
const atualizarAndar = async (req, res) => {
  const { id } = req.params;
  const { numero, predio_id } = req.body;

  if (!numero || !predio_id) {
    return res.status(400).send('numero e predio_id são obrigatórios');
  }

  try {
    const result = await db.query(
      'UPDATE andares SET numero = $1, predio_id = $2 WHERE id = $3 RETURNING *',
      [numero, predio_id, id]
    );
    if (result.rows.length === 0) return res.status(404).send('Andar não encontrado');
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao atualizar andar:', error);
    res.status(500).send('Erro interno');
  }
};


// Deletar
const deletarAndar = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await db.query('DELETE FROM andares WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) return res.status(404).send('Andar não encontrado');
    res.status(200).send('Andar deletado com sucesso');
  } catch (error) {
    console.error('Erro ao deletar andar:', error);
    res.status(500).send('Erro interno');
  }
};

module.exports = {
  listarPorPredio,
  listarAndares,
  buscarAndarPorId,
  criarAndar,
  atualizarAndar,
  deletarAndar
};
