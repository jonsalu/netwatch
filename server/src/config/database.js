const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, '../../database.sqlite');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Erro crítico ao abrir o SQLite:', err.message);
    process.exit(1); // Encerra o app caso o banco falhe
  }
  console.log('📦 Banco de dados SQLite carregado.');
});

// Inicialização de tabelas estruturadas
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS connection_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      pid INTEGER,
      process TEXT,
      local_ip TEXT,
      local_port INTEGER,
      remote_ip TEXT,
      remote_port TEXT,
      protocol TEXT,
      status TEXT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
});

module.exports = db;