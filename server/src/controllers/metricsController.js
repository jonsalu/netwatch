const db = require('../config/database');

/**
 * Salva um lote (array) de conexões direto no banco de dados.
 * O uso de Prepared Statements garante performance em lote.
 */
const saveMetricsBatch = (connections) => {
  if (!Array.isArray(connections)) return;

  const stmt = db.prepare(`
    INSERT INTO connection_history (pid, process, local_ip, local_port, remote_ip, remote_port, protocol, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  connections.forEach(conn => {
    stmt.run(
      conn.pid,
      conn.process,
      conn.local_ip,
      conn.local_port,
      conn.remote_ip,
      conn.remote_port,
      conn.protocol,
      conn.status
    );
  });

  stmt.finalize();
};

module.exports = {
  saveMetricsBatch
};