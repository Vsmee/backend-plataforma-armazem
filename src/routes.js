const express = require('express');
const router = express.Router();
const usuarios = require('./controllers/usuarios');
const depositos = require('./controllers/depositos'); // <- atualizado
const ruas = require('./controllers/ruas');
const predios = require('./controllers/predios');
const andares = require('./controllers/andares');
const apartamentos = require('./controllers/apartamentos');
const produtos = require('./controllers/produtos');
const relatorios = require('./controllers/relatorios');
const integracoes = require('./controllers/integracoesWms');

const verificarToken = require('./auth');

// 🔓 Rota pública: login
router.post('/login', usuarios.fazerLogin);

// 🔐 Rota protegida de teste
router.get('/perfil', verificarToken, (req, res) => {
  res.status(200).json({
    mensagem: 'Rota protegida acessada com sucesso!',
    usuario: req.usuario
  });
});

// 🔐 Rotas protegidas de usuários
router.get('/usuarios', verificarToken, usuarios.listarUsuarios);
router.get('/usuarios/:id', verificarToken, usuarios.buscarUsuarioPorId);
router.post('/usuarios', verificarToken, usuarios.criarUsuario);
router.put('/usuarios/:id', verificarToken, usuarios.atualizarUsuario);
router.delete('/usuarios/:id', verificarToken, usuarios.deletarUsuario);

// ROTAS PROTEGIDAS: Depósitos
router.get('/depositos', verificarToken, depositos.listarDepositos);
router.get('/depositos/:id', verificarToken, depositos.buscarDepositoPorId);
router.post('/depositos', verificarToken, depositos.criarDeposito);
router.put('/depositos/:id', verificarToken, depositos.atualizarDeposito);
router.delete('/depositos/:id', verificarToken, depositos.deletarDeposito);

// RUAS
router.get('/ruas', verificarToken, ruas.listarRuas); // usar ?deposito_id=...
router.get('/ruas/:id', verificarToken, ruas.buscarRuaPorId);
router.post('/ruas', verificarToken, ruas.criarRua);
router.put('/ruas/:id', verificarToken, ruas.atualizarRua);
router.delete('/ruas/:id', verificarToken, ruas.deletarRua);

// PRÉDIOS
router.get('/predios', verificarToken, predios.listarPredios); // usar ?rua_id=...
router.get('/predios/:id', verificarToken, predios.buscarPredioPorId);
router.post('/predios', verificarToken, predios.criarPredio);
router.put('/predios/:id', verificarToken, predios.atualizarPredio);
router.delete('/predios/:id', verificarToken, predios.deletarPredio);

// ANDARES
router.get('/andares', verificarToken, andares.listarAndares); // usar ?predio_id=...
router.get('/andares/:id', verificarToken, andares.buscarAndarPorId);
router.post('/andares', verificarToken, andares.criarAndar);
router.put('/andares/:id', verificarToken, andares.atualizarAndar);
router.delete('/andares/:id', verificarToken, andares.deletarAndar);

// APARTAMENTOS
router.get('/apartamentos', verificarToken, apartamentos.listarApartamentos); // usar ?andar_id=...
router.get('/apartamentos/:id', verificarToken, apartamentos.buscarApartamentoPorId);
router.post('/apartamentos', verificarToken, apartamentos.criarApartamento);
router.put('/apartamentos/:id', verificarToken, apartamentos.atualizarApartamento);
router.delete('/apartamentos/:id', verificarToken, apartamentos.deletarApartamento);

// PRODUTOS
router.get('/produtos', verificarToken, produtos.listarProdutos); // usar ?apartamento_id=...
router.get('/produtos/:id', verificarToken, produtos.buscarProdutoPorId);
router.post('/produtos', verificarToken, produtos.criarProduto);
router.put('/produtos/:id', verificarToken, produtos.atualizarProduto);
router.delete('/produtos/:id', verificarToken, produtos.deletarProduto);

// RELATÓRIOS
router.get('/relatorios', verificarToken, relatorios.listarRelatorios); // usar ?deposito_id=...
router.get('/relatorios/:id', verificarToken, relatorios.buscarRelatorioPorId);
router.post('/relatorios', verificarToken, relatorios.criarRelatorio);
router.delete('/relatorios/:id', verificarToken, relatorios.deletarRelatorio);

// INTEGRAÇÕES WMS
router.get('/integracoes', verificarToken, integracoes.listarIntegracoes);
router.get('/integracoes/:id', verificarToken, integracoes.buscarIntegracaoPorId);
router.post('/integracoes', verificarToken, integracoes.criarIntegracao);
router.put('/integracoes/:id', verificarToken, integracoes.atualizarIntegracao);
router.delete('/integracoes/:id', verificarToken, integracoes.deletarIntegracao);


module.exports = router;
