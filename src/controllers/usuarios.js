const db = require('../db');
require('dotenv').config();

// 🔹 Lista todos os usuários
const listarUsuarios = async (req, res) => {
  try {
    const result = await db.query('SELECT id, nome, email, criado_em FROM usuarios');
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Erro ao listar usuários:', error);
    res.status(500).send('Erro interno');
  }
};

// 🔹 Busca 1 usuário pelo ID
const buscarUsuarioPorId = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query('SELECT id, nome, email, criado_em FROM usuarios WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).send('Usuário não encontrado');
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao buscar usuário:', error);
    res.status(500).send('Erro interno');
  }
};

// 🔹 Cria novo usuário
const bcrypt = require('bcrypt');

const criarUsuario = async (req, res) => {
  const { nome, email, senha } = req.body;

  if (!nome || !email || !senha) {
    return res.status(400).send('Nome, email e senha são obrigatórios');
  }

  try {
    // 🔐 Gera um hash seguro da senha
    const senhaHash = await bcrypt.hash(senha, 10); // 10 = número de rounds (nível de segurança)

    const result = await db.query(
      'INSERT INTO usuarios (nome, email, senha_hash) VALUES ($1, $2, $3) RETURNING id, nome, email, criado_em',
      [nome, email, senhaHash]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao criar usuário:', error);
    res.status(500).send('Erro interno');
  }
};


// 🔹 Atualiza um usuário
const atualizarUsuario = async (req, res) => {
  const { id } = req.params;
  const { nome, email } = req.body;

  try {
    await db.query(
      'UPDATE usuarios SET nome = $1, email = $2 WHERE id = $3',
      [nome, email, id]
    );
    res.status(200).send('Usuário atualizado com sucesso');
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    res.status(500).send('Erro interno');
  }
};

// 🔹 Remove um usuário
const deletarUsuario = async (req, res) => {
  const { id } = req.params;

  try {
    await db.query('DELETE FROM usuarios WHERE id = $1', [id]);
    res.status(200).send('Usuário deletado com sucesso');
  } catch (error) {
    console.error('Erro ao deletar usuário:', error);
    res.status(500).send('Erro interno');
  }
};

const fazerLogin = async (req, res) => {
    const { email, senha } = req.body;
  
    if (!email || !senha) {
      return res.status(400).send('Email e senha são obrigatórios');
    }
  
    try {
      // 1. Busca usuário pelo email
      const result = await db.query('SELECT * FROM usuarios WHERE email = $1', [email]);
  
      if (result.rows.length === 0) {
        return res.status(401).send('Email ou senha inválidos');
      }
  
      const usuario = result.rows[0];
  
      // 2. Compara a senha digitada com o hash
      const senhaConfere = await bcrypt.compare(senha, usuario.senha_hash);
  
      if (!senhaConfere) {
        return res.status(401).send('Email ou senha inválidos');
      }
  
      // 3. Sucesso (por enquanto, só retorna dados básicos)
      const jwt = require('jsonwebtoken');
      const segredo = process.env.JWT_SECRET;
            
      // se a senha conferir
      const token = jwt.sign(
        {
          id: usuario.id,
          email: usuario.email
        },
        segredo,
        { expiresIn: '2h' } // token expira em 2 horas
      );
      
      res.status(200).json({
        mensagem: 'Login realizado com sucesso!',
        token,
        usuario: {
          id: usuario.id,
          nome: usuario.nome,
          email: usuario.email
        }
      });
      
  
    } catch (error) {
      console.error('Erro no login:', error);
      res.status(500).send('Erro interno');
    }
  };

module.exports = {
  listarUsuarios,
  buscarUsuarioPorId,
  criarUsuario,
  atualizarUsuario,
  deletarUsuario,
  fazerLogin
};
  