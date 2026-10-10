import { useState } from "react";
import {
  Callbacks,
  type Room,
} from "@colyseus/sdk";

import { colyseus } from "./game/colyseus";

type PlayerView = {
  id: string;
  connected: boolean;
};

function App() {
  const [status, setStatus] =
    useState("Desconectado");

  const [roomId, setRoomId] =
    useState<string | null>(null);

  const [sessionId, setSessionId] =
    useState<string | null>(null);

  const [players, setPlayers] =
    useState<PlayerView[]>([]);

  const [currentPlayerId, setCurrentPlayerId] =
    useState("");

  const [turnNumber, setTurnNumber] =
    useState(1);

  const [gameRoom, setGameRoom] =
    useState<Room | null>(null);

  async function connect() {
    setStatus("Conectando...");

    try {
      const room =
        await colyseus.joinOrCreate("my_room");

      setGameRoom(room);

      setRoomId(room.roomId);
      setSessionId(room.sessionId);
      setStatus("Conectado");

      const callbacks = Callbacks.get(room);

      callbacks.onAdd(
        "players",
        (player, playerId) => {
          const typedPlayer = player as PlayerView;
          const id = String(playerId);

          console.log(
            "[Client] player added:",
            id,
          );

          setPlayers((current) => {
            const withoutPlayer =
              current.filter(
                (item) => item.id !== id,
              );

            return [
              ...withoutPlayer,
              {
                id,
                connected:
                  typedPlayer.connected,
              },
            ];
          });
        },
      );

      callbacks.onRemove(
        "players",
        (_player, playerId) => {
          const id = String(playerId);

          console.log(
            "[Client] player removed:",
            id,
          );

          setPlayers((current) =>
            current.filter(
              (item) => item.id !== id,
            ),
          );
        },
      );

      callbacks.listen(
        "currentPlayerId",
        (value: string) => {
          setCurrentPlayerId(value);
        },
      );

      callbacks.listen(
        "turnNumber",
        (value: number) => {
          setTurnNumber(value);
        },
      );

      room.onLeave((code) => {
        console.log(
          "[Client] left room:",
          code,
        );

        setStatus("Desconectado");
        setPlayers([]);
        setGameRoom(null);
        setRoomId(null);
        setSessionId(null);
        setCurrentPlayerId("");
      });

      room.onError(
        (code, message) => {
          console.error(
            "[Client] room error:",
            code,
            message,
          );
        },
      );
    } catch (error) {
      console.error(
        "[Client] join failed:",
        error,
      );

      setStatus("Error de conexión");
    }
  }

  function endTurn() {
    if (!gameRoom) {
      return;
    }

    gameRoom.send("end_turn");
  }

  const isMyTurn =
    currentPlayerId === sessionId;

  return (
    <main>
      <h1>Jaurías de Asfalto</h1>

      <p>Estado: {status}</p>

      {roomId && (
        <p>Room: {roomId}</p>
      )}

      {sessionId && (
        <p>Session: {sessionId}</p>
      )}

      <button
        onClick={connect}
        disabled={
          status === "Conectado" ||
          status === "Conectando..."
        }
      >
        Conectar
      </button>

      <h2>Jugadores</h2>

      {players.map((player) => (
        <div key={player.id}>
          {player.id}

          {player.id === sessionId
            ? " ← Tú"
            : ""}
        </div>
      ))}

      <h2>Turno {turnNumber}</h2>

      <p>
        {isMyTurn
          ? "Es tu turno"
          : "Turno del otro jugador"}
      </p>

      <button
        onClick={endTurn}
        disabled={
          !isMyTurn ||
          players.length < 2
        }
      >
        Terminar turno
      </button>
    </main>
  );
}

export default App;