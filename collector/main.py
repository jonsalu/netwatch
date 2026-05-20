import psutil
import json
import time
import socketio

# Inicializa o cliente Socket.IO
sio = socketio.Client()

def get_network_connections():
    connections_list = []
    
    # Kind='inet' filtra conexões IPv4 e IPv6
    for conn in psutil.net_connections(kind='inet'):
        process_name = "Unknown"
        pid = conn.pid
        
        if pid:
            try:
                proc = psutil.Process(pid)
                process_name = proc.name()
            except (psutil.NoSuchProcess, psutil.AccessDenied):
                process_name = "Access Denied / Dead"

        # Extrai IP e Porta tratando conexões sem destino (ex: LISTEN)
        local_ip, local_port = conn.laddr if conn.laddr else ("0.0.0.0", 0)
        remote_ip, remote_port = conn.raddr if conn.raddr else ("-", "-")
        protocol = "TCP" if conn.type == 1 else "UDP"

        connections_list.append({
            "pid": pid,
            "process": process_name,
            "local_ip": local_ip,
            "local_port": local_port,
            "remote_ip": remote_ip,
            "remote_port": remote_port,
            "protocol": protocol,
            "status": conn.status
        })
        
    return connections_list

# Gerenciadores de Eventos do WebSocket
@sio.event
def connect():
    print("\n[Coletor] Conectado com sucesso ao servidor NetWatch!")

@sio.event
def disconnect():
    print("\n[Coletor] Conexão perdida! Tentando reconectar automaticamente...")

if __name__ == "__main__":
    print("--- NetWatch Coletor Python (Modo WebSocket Persistente) ---")
    
    # Tenta conectar ao backend Node.js
    try:
        sio.connect('http://localhost:3001')
    except Exception as e:
        print(f"[Erro Inicial] Não foi possível conectar ao servidor: {e}")

    try:
        while True:
            if sio.connected:
                payload = get_network_connections()
                
                # Dispara o evento personalizado com os dados brutos
                sio.emit('metrics-packet', payload)
                print(f"[Coletor] {len(payload)} conexões transmitidas pelo túnel.", end="\r")
            
            time.sleep(2)
            
    except KeyboardInterrupt:
        print("\nDesconectando do servidor...")
        sio.disconnect()
        print("Coletor encerrado.")