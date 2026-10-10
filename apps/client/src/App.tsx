import { useState } from "react";
import { Callbacks } from "@colyseus/sdk";

import { colyseus } from "./game/colyseus";

type PlayerView = {
  id: string;
  connected: boolean;
};

function App() {
  const [status, setStatus] = useState("Desconectado");
  const [roomId, setRoomId] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [players, setPlayers] = useState<PlayerView[]>([]);

  async function connect() {
    setStatus("Conectando...");

    try {
      const room = await colyseus.joinOrCreate("my_room");

      setRoomId(room.roomId);
      setSessionId(room.sessionId);
      setStatus("Conectado");

      const callbacks = Callbacks.get(room);

      callbacks.onAdd(
        "players",
        (player: PlayerView, playerId: string) => {
          console.log("[Client] player added:", playerId);

          setPlayers((current) => {
            const withoutPlayer = current.filter(
              (item) => item.id !== playerId,
            );

            return [
              ...withoutPlayer,
              {
                id: playerId,
                connected: player.connected,
              },
            ];
          });
        },
      );

      callbacks.onRemove(
        "players",
        (_player: PlayerView, playerId: string) => {
          console.log("[Client] player removed:", playerId);

          setPlayers((current) =>
            current.filter((item) => item.id !== playerId),
          );
        },
      );

      room.onLeave((code) => {
        console.log("[Client] left room:", code);
        setStatus("Desconectado");
        setPlayers([]);
      });

      room.onError((code, message) => {
        console.error("[Client] room error:", code, message);
      });
    } catch (error) {
      console.error("[Client] join failed:", error);
      setStatus("Error de conexión");
    }
  }

  return (
    <main>
      <h1>Jaurías de Asfalto</h1>

      <p>Estado: {status}</p>

      {roomId && <p>Room: {roomId}</p>}
      {sessionId && <p>Session: {sessionId}</p>}

      <button
        onClick={connect}
        disabled={status === "Conectado"}
      >
        Conectar
      </button>

      <h2>Jugadores</h2>

      {players.map((player) => (
        <div key={player.id}>
          {player.id}
          {player.id === sessionId ? " ← Tú" : ""}
        </div>
      ))}
    </main>
  );
}

export default App;