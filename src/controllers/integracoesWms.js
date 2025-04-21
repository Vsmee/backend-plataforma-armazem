const db = require('../db');

// Listar integrações do usuário logado
const listarIntegracoes = async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM integracoes_wms WHERE usuario_id = $1',
      [req.usuario.id]
    );
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Erro ao listar integrações:', error);
    res.status(500).send('Erro interno');
  }
};

// Buscar integração por ID
const buscarIntegracaoPorId = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query(
      'SELECT * FROM integracoes_wms WHERE id = $1 AND usuario_id = $2',
      [id, req.usuario.id]
    );
    if (result.rows.length === 0) return res.status(404).send('Integração não encontrada');
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao buscar integração:', error);
    res.status(500).send('Erro interno');
  }
};

// Criar integração
const criarIntegracao = async (req, res) => {
  const { token, endpoint, status } = req.body;

  try {
    const result = await db.query(
      'INSERT INTO integracoes_wms (usuario_id, token, endpoint, status, ultimo_sync) VALUES ($1, $2, $3, $4, NOW()) RETURNING *',
      [req.usuario.id, token, endpoint, status || 'ativo']
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao criar integração:', error);
    res.status(500).send('Erro interno');
  }
};

// Atualizar integração
const atualizarIntegracao = async (req, res) => {
  const { id } = req.params;
  const { token, endpoint, status } = req.body;

  try {
    const result = await db.query(
      'UPDATE integracoes_wms SET token = $1, endpoint = $2, status = $3, ultimo_sync = NOW() WHERE id = $4 AND usuario_id = $5 RETURNING *',
      [token, endpoint, status, id, req.usuario.id]
    );
    if (result.rows.length === 0) return res.status(404).send('Integração não encontrada ou sem permissão');
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao atualizar integração:', error);
    res.status(500).send('Erro interno');
  }
};

// Deletar integração
const deletarIntegracao = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await db.query(
      'DELETE FROM integracoes_wms WHERE id = $1 AND usuario_id = $2 RETURNING *',
      [id, req.usuario.id]
    );
    if (result.rows.length === 0) return res.status(404).send('Integração não encontrada');
    res.status(200).send('Integração removida com sucesso');
  } catch (error) {
    console.error('Erro ao deletar integração:', error);
    res.status(500).send('Erro interno');
  }
};

module.exports = {
  listarIntegracoes,
  buscarIntegracaoPorId,
  criarIntegracao,
  atualizarIntegracao,
  deletarIntegracao
};
