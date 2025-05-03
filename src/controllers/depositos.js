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
const importarLayout = async (req, res) => {
  const depositoId = parseInt(req.params.id, 10);
  const dados = req.body;

  if (!Array.isArray(dados)) {
    return res.status(400).json({ erro: 'Formato inválido. Esperado um array de células.' });
  }

  const client = await db.connect();
  try {
    console.log('📦 Iniciando importação, depósito:', depositoId);
    console.log('📄 Dados recebidos:', dados.slice(0, 5)); // só mostra os 5 primeiros

    await client.query('BEGIN');

    const ruasMap = new Map();
    const prediosMap = new Map();

    for (const celula of dados) {
      const { tipo, codigo, nome, x, y } = celula;

      if (!codigo || typeof x !== 'number' || typeof y !== 'number') continue;

      const nomeFinal = nome && nome.trim() !== '' ? nome : codigo;
      const targetMap = tipo === 'rua' ? ruasMap : tipo === 'predio' ? prediosMap : null;
      if (!targetMap) continue;

      if (!targetMap.has(codigo)) {
        targetMap.set(codigo, { nome: nomeFinal, posicoes: [] });
      }
      targetMap.get(codigo).posicoes.push({ x, y });
    }

    console.log('🧱 Ruas map:', [...ruasMap.entries()]);
    console.log('🏢 Prédios map:', [...prediosMap.entries()]);

    await client.query(`
      DELETE FROM rua_posicoes
      WHERE rua_id IN (SELECT id FROM ruas WHERE deposito_id = $1)
    `, [depositoId]);

    await client.query(`
      DELETE FROM predio_posicoes
      WHERE predio_id IN (SELECT id FROM predios WHERE deposito_id = $1)
    `, [depositoId]);

    // deletar ruas/predios antigos
    const codigosRuas = [...ruasMap.keys()];
    const codigosPredios = [...prediosMap.keys()];

    if (codigosRuas.length > 0) {
      await client.query(
        `DELETE FROM ruas
         WHERE deposito_id = $1 AND (codigo IS NULL OR codigo NOT IN (${codigosRuas.map((_, i) => `$${i + 2}`).join(', ')}))`,
        [depositoId, ...codigosRuas]
      );
    } else {
      await client.query('DELETE FROM ruas WHERE deposito_id = $1', [depositoId]);
    }

    if (codigosPredios.length > 0) {
      await client.query(
        `DELETE FROM predios
         WHERE deposito_id = $1 AND (codigo IS NULL OR codigo NOT IN (${codigosPredios.map((_, i) => `$${i + 2}`).join(', ')}))`,
        [depositoId, ...codigosPredios]
      );
    } else {
      await client.query('DELETE FROM predios WHERE deposito_id = $1', [depositoId]);
    }

    for (const [codigo, { nome, posicoes }] of ruasMap.entries()) {
      const result = await client.query(
        `INSERT INTO ruas (codigo, nome, deposito_id)
         VALUES ($1, $2, $3)
         ON CONFLICT (codigo, deposito_id) DO UPDATE SET nome = EXCLUDED.nome
         RETURNING id`,
        [codigo, nome, depositoId]
      );

      const ruaId = result.rows[0]?.id;
      console.log(`🟦 Rua ${codigo} => ID: ${ruaId}`);

      for (const { x, y } of posicoes) {
        console.log(`   ➕ Posição RUA: (${x}, ${y})`);
        await client.query(
          'INSERT INTO rua_posicoes (rua_id, x, y) VALUES ($1, $2, $3)',
          [ruaId, x, y]
        );
      }
    }

    for (const [codigo, { nome, posicoes }] of prediosMap.entries()) {
      const result = await client.query(
        `INSERT INTO predios (codigo, nome, deposito_id)
         VALUES ($1, $2, $3)
         ON CONFLICT (codigo, deposito_id) DO UPDATE SET nome = EXCLUDED.nome
         RETURNING id`,
        [codigo, nome, depositoId]
      );

      const predioId = result.rows[0]?.id;
      console.log(`🟥 Prédio ${codigo} => ID: ${predioId}`);

      for (const { x, y } of posicoes) {
        console.log(`   ➕ Posição PRÉDIO: (${x}, ${y})`);
        await client.query(
          'INSERT INTO predio_posicoes (predio_id, x, y) VALUES ($1, $2, $3)',
          [predioId, x, y]
        );
      }
    }

    await client.query('COMMIT');
    res.status(200).json({ mensagem: 'Layout importado com sucesso.' });

  } catch (erro) {
    await client.query('ROLLBACK');
    console.error('❌ Erro ao importar layout:', erro);
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
