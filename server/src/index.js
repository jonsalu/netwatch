const express = require('express');
const http = require('http');
const initSocketService = require('./services/socketService');

const app = express();
const server = http.createServer(app);

// Inicializa os serviços WebSocket acoplados ao servidor HTTP
initSocketService(server);

const PORT = 3001;
server.listen(PORT, () => {
  console.log(`🚀 Servidor NetWatch Core rodando na porta ${PORT}`);
});