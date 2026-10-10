import { useState } from "react";
import {
  Callbacks,
  type Room,
} from "@colyseus/sdk";

import { colyseus } from "./game/colyseus";
import { sendEndTurn } from "./game/actions";

type PlayerView = {
  id: string;
  connected: boolean;
};

type TileView = {
  id: string;
  x: number;
  y: number;
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
    
  const [tiles, setTiles] =
    useState<TileView[]>([]);

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

      callbacks.onAdd(
        "tiles",
        (tile, tileId) => {
          const typedTile =
            tile as TileView;

          const id =
            String(tileId);

          setTiles((current) => {
            const withoutTile =
              current.filter(
                (item) =>
                  item.id !== id,
              );

            return [
              ...withoutTile,
              {
                id,
                x: typedTile.x,
                y: typedTile.y,
              },
            ];
          });
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

    sendEndTurn(gameRoom);
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

      <h2>Mapa</h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(3, 80px)",
          gap: "8px",
        }}
      >
        {[...tiles]
          .sort(
            (a, b) =>
              a.y - b.y ||
              a.x - b.x,
          )
          .map((tile) => (
            <div
              key={tile.id}
              style={{
                width: 80,
                height: 80,
                border: "1px solid white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {tile.x},{tile.y}
            </div>
          ))}
      </div>
    </main>
  );
}

export default App;