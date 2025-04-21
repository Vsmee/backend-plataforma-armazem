const jwt = require('jsonwebtoken');
const segredo = process.env.JWT_SECRET;

const verificarToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  // Verifica se o header está presente
  if (!authHeader) {
    return res.status(401).send('Token não fornecido');
  }

  // Esperado formato: Bearer token_aqui
  const token = authHeader.split(' ')[1];

  try {
    console.log('🔐 Segredo JWT usado:', segredo);
    const payload = jwt.verify(token, segredo);
    req.usuario = payload; // coloca info do usuário no request
    next(); // segue para a rota
  } catch (error) {
    return res.status(403).send('Token inválido ou expirado');
  }
};

module.exports = verificarToken;
