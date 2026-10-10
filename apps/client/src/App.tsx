import { useState } from "react";

import { colyseus } from "./game/colyseus";

function App() {
  const [status, setStatus] = useState("Desconectado");
  const [roomId, setRoomId] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);

  async function connect() {
    try {
      setStatus("Conectando...");

      const room = await colyseus.joinOrCreate("my_room");

      setRoomId(room.roomId);
      setSessionId(room.sessionId);
      setStatus("Conectado");

      console.log("Room:", room);
    } catch (error) {
      console.error(error);
      setStatus("Error de conexión");
    }
  }

  return (
    <main>
      <h1>Jaurías de Asfalto</h1>

      <p>Estado: {status}</p>

      {roomId && <p>Room: {roomId}</p>}
      {sessionId && <p>Session: {sessionId}</p>}

      <button onClick={connect}>
        Conectar
      </button>
    </main>
  );
}

export default App;