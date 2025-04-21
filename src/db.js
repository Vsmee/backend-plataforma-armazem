const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'postgres',
  password: '#Projetotcc2085',
  port: 5432
});

pool.on('connect', () => {
  console.log('🟢 Conectado ao PostgreSQL!');
});

module.exports = pool; // ← IMPORTANTE! NÃO usar { pool }
