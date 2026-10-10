import { useState } from "react";

import {
  Callbacks,
  type Room,
} from "@colyseus/sdk";

import { colyseus } from "../game/colyseus";

import {
  sendEndTurn,
  sendMove,
} from "../game/actions";

import type {
  ConnectionStatus,
  DogView,
  PlayerView,
  TileView,
} from "../types/game";

type SyncedDog =
  DogView & object;

export function useGameRoom() {
  const [
    status,
    setStatus,
  ] = useState<ConnectionStatus>(
    "Desconectado",
  );

  const [
    roomId,
    setRoomId,
  ] = useState<string | null>(
    null,
  );

  const [
    sessionId,
    setSessionId,
  ] = useState<string | null>(
    null,
  );

  const [
    players,
    setPlayers,
  ] = useState<PlayerView[]>(
    [],
  );

  const [
    tiles,
    setTiles,
  ] = useState<TileView[]>(
    [],
  );

  const [
    dogs,
    setDogs,
  ] = useState<DogView[]>(
    [],
  );

  const [
    currentPlayerId,
    setCurrentPlayerId,
  ] = useState("");

  const [
    turnNumber,
    setTurnNumber,
  ] = useState(1);

  const [
    gameRoom,
    setGameRoom,
  ] = useState<Room | null>(
    null,
  );

  async function connect() {
    setStatus(
      "Conectando...",
    );

    try {
      const room =
        await colyseus.joinOrCreate(
          "my_room",
        );

      setGameRoom(room);

      setRoomId(
        room.roomId,
      );

      setSessionId(
        room.sessionId,
      );

      setStatus(
        "Conectado",
      );

      registerCallbacks(
        room,
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

  function registerCallbacks(
    room: Room,
  ) {
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

        setPlayers(
          (current) => [
            ...current.filter(
              (item) =>
                item.id !== id,
            ),
            {
              id,
              connected:
                typedPlayer.connected,
            },
          ],
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
          (current) => [
            ...current.filter(
              (item) =>
                item.id !== id,
            ),
            {
              id,
              x: typedTile.x,
              y: typedTile.y,
            },
          ],
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
      (
        dog,
        dogId,
      ) => {
        const typedDog =
          dog as SyncedDog;

        const id =
          String(dogId);

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
      (
        value: string,
      ) => {
        setCurrentPlayerId(
          value,
        );
      },
    );

    callbacks.listen(
      "turnNumber",
      (
        value: number,
      ) => {
        setTurnNumber(
          value,
        );
      },
    );

    room.onLeave(
      (code) => {
        console.log(
          "[Client] left room:",
          code,
        );

        resetGame();
      },
    );

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
  }

  function resetGame() {
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
  }

  function endTurn() {
    if (!gameRoom) {
      return;
    }

    sendEndTurn(
      gameRoom,
    );
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

  return {
    status,
    roomId,
    sessionId,

    players,
    tiles,
    dogs,

    turnNumber,
    isMyTurn,

    connect,
    endTurn,
    moveTo,
    canMoveTo,
  };
}