import { useState } from "react";
import {
  Callbacks,
  type Room,
} from "@colyseus/sdk";

import { colyseus } from "./game/colyseus";
import {
  sendEndTurn,
  sendMove,
} from "./game/actions";

type PlayerView = {
  id: string;
  connected: boolean;
};

type TileView = {
  id: string;
  x: number;
  y: number;
};

type DogView = {
  id: string;
  ownerId: string;
  tileId: string;
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

  const [dogs, setDogs] =
    useState<DogView[]>([]);

  const [
    currentPlayerId,
    setCurrentPlayerId,
  ] = useState("");

  const [
    turnNumber,
    setTurnNumber,
  ] = useState(1);

  const [gameRoom, setGameRoom] =
    useState<Room | null>(null);

  async function connect() {
    setStatus("Conectando...");

    try {
      const room =
        await colyseus.joinOrCreate(
          "my_room",
        );

      setGameRoom(room);

      setRoomId(room.roomId);
      setSessionId(room.sessionId);
      setStatus("Conectado");

      const callbacks =
        Callbacks.get(room);

      callbacks.onAdd(
        "players",
        (
          player,
          playerId,
        ) => {
          const typedPlayer =
            player as PlayerView;

          const id =
            String(playerId);

          console.log(
            "[Client] player added:",
            id,
          );

          setPlayers(
            (current) => {
              const withoutPlayer =
                current.filter(
                  (item) =>
                    item.id !== id,
                );

              return [
                ...withoutPlayer,
                {
                  id,
                  connected:
                    typedPlayer.connected,
                },
              ];
            },
          );
        },
      );

      callbacks.onRemove(
        "players",
        (
          _player,
          playerId,
        ) => {
          const id =
            String(playerId);

          console.log(
            "[Client] player removed:",
            id,
          );

          setPlayers(
            (current) =>
              current.filter(
                (item) =>
                  item.id !== id,
              ),
          );
        },
      );

      callbacks.onAdd(
        "tiles",
        (
          tile,
          tileId,
        ) => {
          const typedTile =
            tile as TileView;

          const id =
            String(tileId);

          setTiles(
            (current) => {
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
            },
          );
        },
      );

      callbacks.onRemove(
        "tiles",
        (
          _tile,
          tileId,
        ) => {
          const id =
            String(tileId);

          setTiles(
            (current) =>
              current.filter(
                (item) =>
                  item.id !== id,
              ),
          );
        },
      );

      callbacks.onAdd(
        "dogs",
        (dog, dogId) => {
          const typedDog =
            dog as DogView & object;

          const id =
            String(dogId);

          console.log(
            "[Client] dog added:",
            id,
          );

          setDogs(
            (current) => [
              ...current.filter(
                (item) =>
                  item.id !== id,
              ),
              {
                id,
                ownerId:
                  typedDog.ownerId,
                tileId:
                  typedDog.tileId,
              },
            ],
          );

          callbacks.onChange(
            typedDog,
            () => {
              const tileId =
                String(
                  typedDog.tileId,
                );

              console.log(
                "[Client] dog moved:",
                id,
                "->",
                tileId,
              );

              setDogs(
                (current) =>
                  current.map(
                    (item) =>
                      item.id === id
                        ? {
                            ...item,
                            tileId,
                          }
                        : item,
                  ),
              );
            },
          );
        },
      );

      callbacks.onRemove(
        "dogs",
        (
          _dog,
          dogId,
        ) => {
          const id =
            String(dogId);

          console.log(
            "[Client] dog removed:",
            id,
          );

          setDogs(
            (current) =>
              current.filter(
                (item) =>
                  item.id !== id,
              ),
          );
        },
      );

      callbacks.listen(
        "currentPlayerId",
        (value: string) => {
          setCurrentPlayerId(
            value,
          );
        },
      );

      callbacks.listen(
        "turnNumber",
        (value: number) => {
          setTurnNumber(
            value,
          );
        },
      );

      room.onLeave((code) => {
        console.log(
          "[Client] left room:",
          code,
        );

        setStatus(
          "Desconectado",
        );

        setPlayers([]);
        setTiles([]);
        setDogs([]);

        setGameRoom(null);
        setRoomId(null);
        setSessionId(null);

        setCurrentPlayerId("");
        setTurnNumber(1);
      });

      room.onError(
        (
          code,
          message,
        ) => {
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

      setStatus(
        "Error de conexión",
      );
    }
  }

  function endTurn() {
    if (!gameRoom) {
      return;
    }

    sendEndTurn(
      gameRoom,
    );
  }

  const isMyTurn =
    currentPlayerId ===
    sessionId;

  const myDog =
    dogs.find(
      (dog) =>
        dog.ownerId ===
        sessionId,
    );

  const myTile =
    tiles.find(
      (tile) =>
        tile.id ===
        myDog?.tileId,
    );

  function canMoveTo(
    tile: TileView,
  ) {
    if (
      !isMyTurn ||
      players.length < 2 ||
      !myTile
    ) {
      return false;
    }

    const distance =
      Math.abs(
        myTile.x -
          tile.x,
      ) +
      Math.abs(
        myTile.y -
          tile.y,
      );

    return distance === 1;
  }

  function moveTo(
    tileId: string,
  ) {
    if (!gameRoom) {
      return;
    }

    sendMove(
      gameRoom,
      tileId,
    );
  }

  const sortedTiles =
    [...tiles].sort(
      (a, b) =>
        a.y - b.y ||
        a.x - b.x,
    );

  return (
    <main>
      <h1>
        Jaurías de Asfalto
      </h1>

      <p>
        Estado: {status}
      </p>

      {roomId && (
        <p>
          Room: {roomId}
        </p>
      )}

      {sessionId && (
        <p>
          Session: {sessionId}
        </p>
      )}

      <button
        onClick={connect}
        disabled={
          status ===
            "Conectado" ||
          status ===
            "Conectando..."
        }
      >
        Conectar
      </button>

      <h2>Jugadores</h2>

      {players.map(
        (player) => (
          <div
            key={
              player.id
            }
          >
            {player.id}

            {player.id ===
            sessionId
              ? " ← Tú"
              : ""}
          </div>
        ),
      )}

      <h2>
        Turno {turnNumber}
      </h2>

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
            "repeat(3, 100px)",
          gap: "8px",
        }}
      >
        {sortedTiles.map(
          (tile) => {
            const dogsHere =
              dogs.filter(
                (dog) =>
                  dog.tileId ===
                  tile.id,
              );

            const canMove =
              canMoveTo(tile);

            return (
              <button
                key={
                  tile.id
                }
                onClick={() =>
                  moveTo(
                    tile.id,
                  )
                }
                disabled={
                  !canMove
                }
                style={{
                  width:
                    100,
                  height:
                    100,
                  display:
                    "flex",
                  flexDirection:
                    "column",
                  alignItems:
                    "center",
                  justifyContent:
                    "center",
                  gap: "6px",
                  cursor:
                    canMove
                      ? "pointer"
                      : "default",
                }}
              >
                <div>
                  {tile.x},
                  {tile.y}
                </div>

                {dogsHere.map(
                  (dog) => (
                    <div
                      key={
                        dog.id
                      }
                    >
                      🐕{" "}
                      {dog.ownerId ===
                      sessionId
                        ? "Tú"
                        : "Rival"}
                    </div>
                  ),
                )}
              </button>
            );
          },
        )}
      </div>
    </main>
  );
}

export default App;