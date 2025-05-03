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

// Importar Layout
// Importar Layout
const importarLayout = async (req, res) => {
  const depositoId = parseInt(req.params.id, 10);
  const dados = req.body; // Array de células [{ tipo, codigo, x, y }]

  if (!Array.isArray(dados)) {
    return res.status(400).json({ erro: 'Formato inválido. Esperado um array de células.' });
  }

  const codigosNovosRuas = new Set();
  const codigosNovosPredios = new Set();

  for (const celula of dados) {
    if (celula.tipo === 'rua') codigosNovosRuas.add(celula.codigo);
    if (celula.tipo === 'predio') codigosNovosPredios.add(celula.codigo);
  }

  const client = await db.connect();

  try {
    await client.query('BEGIN');

    // 🧹 Deletar RUAS antigas
    if (codigosNovosRuas.size > 0) {
      const codigosArray = Array.from(codigosNovosRuas);
      await client.query(
        `DELETE FROM ruas
         WHERE deposito_id = $1 AND (codigo IS NULL OR codigo NOT IN (${codigosArray.map((_, i) => `$${i + 2}`).join(', ')}))`,
        [depositoId, ...codigosArray]
      );
    } else {
      await client.query('DELETE FROM ruas WHERE deposito_id = $1', [depositoId]);
    }

    // 🧹 Deletar PRÉDIOS antigos
    if (codigosNovosPredios.size > 0) {
      const codigosArray = Array.from(codigosNovosPredios);
      await client.query(
        `DELETE FROM predios
         WHERE deposito_id = $1 AND (codigo IS NULL OR codigo NOT IN (${codigosArray.map((_, i) => `$${i + 2}`).join(', ')}))`,
        [depositoId, ...codigosArray]
      );
    } else {
      await client.query('DELETE FROM predios WHERE deposito_id = $1', [depositoId]);
    }

    // 🔁 Inserir ou atualizar as células recebidas
    for (const celula of dados) {
      const { tipo, codigo, nome, x, y } = celula;

      const nomeFinal = nome && nome.trim() !== '' ? nome : codigo;

      if (!codigo || typeof x !== 'number' || typeof y !== 'number') continue;

      if (tipo === 'rua') {
        const jaExiste = await client.query(
          'SELECT id FROM ruas WHERE codigo = $1 AND deposito_id = $2',
          [codigo, depositoId]
        );

        if (jaExiste.rows.length) {
          if (nome && nome.trim() !== '') {
            await client.query(
              'UPDATE ruas SET x = $1, y = $2, nome = $3 WHERE id = $4',
              [x, y, nome, jaExiste.rows[0].id]
            );
          } else {
            await client.query(
              'UPDATE ruas SET x = $1, y = $2 WHERE id = $3',
              [x, y, jaExiste.rows[0].id]
            );
          }
        } else {
          await client.query(
            'INSERT INTO ruas (codigo, nome, x, y, deposito_id) VALUES ($1, $2, $3, $4, $5)',
            [codigo, nomeFinal, x, y, depositoId]
          );
        }
      }

      if (tipo === 'predio') {
        const jaExiste = await client.query(
          'SELECT id FROM predios WHERE codigo = $1 AND deposito_id = $2',
          [codigo, depositoId]
        );

        if (jaExiste.rows.length) {
          if (nome && nome.trim() !== '') {
            await client.query(
              'UPDATE predios SET x = $1, y = $2, nome = $3 WHERE id = $4',
              [x, y, nome, jaExiste.rows[0].id]
            );
          } else {
            await client.query(
              'UPDATE predios SET x = $1, y = $2 WHERE id = $3',
              [x, y, jaExiste.rows[0].id]
            );
          }
        } else {
          await client.query(
            'INSERT INTO predios (codigo, nome, x, y, deposito_id) VALUES ($1, $2, $3, $4, $5)',
            [codigo, nomeFinal, x, y, depositoId]
          );
        }
      }
    }

    await client.query('COMMIT');
    res.status(200).json({ mensagem: 'Layout importado com sucesso.' });
  } catch (erro) {
    await client.query('ROLLBACK');
    console.error(erro);
    res.status(500).json({ erro: 'Erro ao importar layout.' });
  } finally {
    client.release();
  }
};



module.exports = {
  listarDepositos,
  buscarDepositoPorId,
  criarDeposito,
  atualizarDeposito,
  deletarDeposito,
  importarLayout,
};
