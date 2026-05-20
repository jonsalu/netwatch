import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

// Estabelece a conexão com o Node.js. 
// Fica fora do componente para não reconectar toda vez que a tela redesenhar.
const socket = io('http://localhost:3001');

export default function App() {
  // Estado que vai guardar a nossa lista de conexões (o array de JSONs do Python)
  const [connections, setConnections] = useState([]);
  
  // Estado para dar um feedback visual se o painel está conectado ao servidor
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // 1. Escuta se conectou com sucesso
    socket.on('connect', () => setIsConnected(true));
    
    // 2. Escuta se a conexão caiu (se você derrubar o Node.js, por exemplo)
    socket.on('disconnect', () => setIsConnected(false));

    // 3. A mágica acontece aqui: escuta a enxurrada de dados e atualiza a tela
    socket.on('network-updates', (data) => {
      setConnections(data);
    });

    // Boa prática de Sênior: A função de "cleanup".
    // Se este componente for destruído, removemos os listeners da memória para evitar vazamento (memory leak).
    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('network-updates');
    };
  }, []); // O array vazio [] garante que esse setup do socket rode apenas 1 vez quando a tela carregar.

  return (
    <div className="min-h-screen p-8">
      {/* Cabeçalho do Dashboard */}
      <header className="flex justify-between items-center mb-8 border-b border-slate-700 pb-4">
        <div>
          <h1 className="text-3xl font-bold text-emerald-400">📡 NetWatch</h1>
          <p className="text-slate-400 text-sm mt-1">Observabilidade de Rede em Tempo Real</p>
        </div>
        
        {/* Indicador de Status da Conexão */}
        <div className="flex items-center gap-3 bg-slate-800 px-4 py-2 rounded-full shadow">
          <div className={`h-3 w-3 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}></div>
          <span className="text-sm font-semibold text-slate-300">
            {isConnected ? 'SISTEMA ONLINE' : 'OFFLINE'}
          </span>
        </div>
      </header>

      {/* Tabela de Dados */}
      <div className="bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden shadow-2xl">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-900 text-slate-300">
            <tr>
              <th className="p-4 font-semibold uppercase tracking-wider">Processo (PID)</th>
              <th className="p-4 font-semibold uppercase tracking-wider">Protocolo</th>
              <th className="p-4 font-semibold uppercase tracking-wider">Origem (Local)</th>
              <th className="p-4 font-semibold uppercase tracking-wider">Destino (Remoto)</th>
              <th className="p-4 font-semibold uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/50">
            {connections.length === 0 ? (
              <tr>
                <td colSpan="5" className="p-8 text-center text-slate-500 italic">
                  Aguardando stream de pacotes de rede...
                </td>
              </tr>
            ) : (
              connections.map((conn, index) => (
                <tr key={index} className="hover:bg-slate-700/30 transition-colors font-mono">
                  
                  {/* Processo e PID */}
                  <td className="p-4">
                    <span className="font-bold text-slate-200">{conn.process}</span>
                    <span className="text-slate-500 ml-2">({conn.pid})</span>
                  </td>
                  
                  {/* Protocolo */}
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                      conn.protocol === 'TCP' ? 'bg-blue-900/50 text-blue-400' : 'bg-amber-900/50 text-amber-400'
                    }`}>
                      {conn.protocol}
                    </span>
                  </td>
                  
                  {/* Local IP:Port */}
                  <td className="p-4 text-slate-300">
                    {conn.local_ip}<span className="text-slate-500">:{conn.local_port}</span>
                  </td>
                  
                  {/* Remote IP:Port */}
                  <td className="p-4 text-slate-300">
                    {conn.remote_ip !== '-' ? (
                      <>{conn.remote_ip}<span className="text-slate-500">:{conn.remote_port}</span></>
                    ) : (
                      <span className="text-slate-600">-</span>
                    )}
                  </td>
                  
                  {/* Status (Ex: LISTEN, ESTABLISHED) */}
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      conn.status === 'ESTABLISHED' ? 'bg-emerald-900/30 text-emerald-400 border border-emerald-800' :
                      conn.status === 'LISTEN' ? 'bg-purple-900/30 text-purple-400 border border-purple-800' :
                      'bg-slate-800 text-slate-400 border border-slate-700'
                    }`}>
                      {conn.status || 'N/A'}
                    </span>
                  </td>

                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}