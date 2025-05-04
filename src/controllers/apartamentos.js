const db = require('../db');



const listarApartamentos = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT
        apartamentos.id,
        apartamentos.nome,
        apartamentos.codigo,
        apartamentos.andar_id,
        andares.nome AS nome_andar,
        andares.predio_id
      FROM apartamentos
      JOIN andares ON apartamentos.andar_id = andares.id
      ORDER BY andares.nome, apartamentos.nome;
    `);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Erro ao listar apartamentos:', error);
    res.status(500).send('Erro ao buscar apartamentos.');
  }
};


// Listar apartamentos por andar
const listarPorAndar = async (req, res) => {
  const { andar_id } = req.query;

  if (!andar_id) return res.status(400).send('andar_id é obrigatório');

  try {
    const result = await db.query(
      'SELECT * FROM apartamentos WHERE andar_id = $1',
      [andar_id]
    );
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Erro ao listar apartamentos:', error);
    res.status(500).send('Erro interno');
  }
};

// Buscar por ID
const buscarApartamentoPorId = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query('SELECT * FROM apartamentos WHERE id = $1', [id]);
    if (result.rows.length === 0) return res.status(404).send('Apartamento não encontrado');
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao buscar apartamento:', error);
    res.status(500).send('Erro interno');
  }
};

// Criar
const criarApartamento = async (req, res) => {
  const { numero, andar_id } = req.body;

  if (!numero || !andar_id) {
    return res.status(400).send('numero e andar_id são obrigatórios');
  }

  try {
    const result = await db.query(
      'INSERT INTO apartamentos (numero, andar_id) VALUES ($1, $2) RETURNING *',
      [numero, andar_id]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao criar apartamento:', error);
    res.status(500).send('Erro interno');
  }
};

// Atualizar
const atualizarApartamento = async (req, res) => {
  const { id } = req.params;
  const { numero } = req.body;

  try {
    const result = await db.query(
      'UPDATE apartamentos SET numero = $1 WHERE id = $2 RETURNING *',
      [numero, id]
    );
    if (result.rows.length === 0) return res.status(404).send('Apartamento não encontrado');
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao atualizar apartamento:', error);
    res.status(500).send('Erro interno');
  }
};

// Deletar
const deletarApartamento = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await db.query('DELETE FROM apartamentos WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) return res.status(404).send('Apartamento não encontrado');
    res.status(200).send('Apartamento deletado com sucesso');
  } catch (error) {
    console.error('Erro ao deletar apartamento:', error);
    res.status(500).send('Erro interno');
  }
};

module.exports = {
  listarPorAndar,
  listarApartamentos,
  buscarApartamentoPorId,
  criarApartamento,
  atualizarApartamento,
  deletarApartamento
};
