const { Server } = require('socket.io');
const metricsController = require('../controllers/metricsController');

const initSocketService = (server) => {
  const io = new Server(server, {
    cors: { origin: "*", methods: ["GET", "POST"] }
  });

  io.on('connection', (socket) => {
    console.log(`🔌 Novo dispositivo conectado ao barramento: ${socket.id}`);

    // Canal onde o coletor Python descarrega as informações
    socket.on('metrics-packet', (connections) => {
      
      // Ação 1: Transmite direto para a interface React sem intermediários HTTP
      io.emit('network-updates', connections);

      // Ação 2: Despacha para o controlador salvar no banco em background
      metricsController.saveMetricsBatch(connections);
    });

    socket.on('disconnect', () => {
      console.log(`❌ Dispositivo desconectado: ${socket.id}`);
    });
  });

  return io;
};

module.exports = initSocketService;