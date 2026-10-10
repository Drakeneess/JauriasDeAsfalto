import {
  useState,
} from "react";

import type {
  Room,
} from "@colyseus/sdk";

import {
  colyseus,
} from "../game/colyseus";

import {
  sendEndTurn,
  sendMove,
} from "../game/actions";

import {
  canMoveToTile,
  findDogTile,
  findMyBase,
  findMyDog,
} from "../game/selectors";

import {
  registerRoomCallbacks,
} from "../game/sync/registerRoomCallbacks";

import type {
  BaseView,
  ConnectionStatus,
  DogView,
  PlayerView,
  TileView,
} from "../types/game";

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
    bases,
    setBases,
  ] = useState<BaseView[]>(
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

  function resetGame() {
    setStatus(
      "Desconectado",
    );

    setRoomId(null);
    setSessionId(null);

    setPlayers([]);
    setTiles([]);
    setDogs([]);
    setBases([]);

    setCurrentPlayerId("");
    setTurnNumber(1);

    setGameRoom(null);
  }

  async function connect() {
    if (gameRoom) {
      return;
    }

    setStatus(
      "Conectando...",
    );

    try {
      const room =
        await colyseus.joinOrCreate(
          "my_room",
        );

      setGameRoom(
        room,
      );

      setRoomId(
        room.roomId,
      );

      setSessionId(
        room.sessionId,
      );

      registerRoomCallbacks(
        room,
        {
          setPlayers,
          setTiles,
          setDogs,
          setBases,

          setCurrentPlayerId,
          setTurnNumber,

          onLeave:
            resetGame,
        },
      );

      setStatus(
        "Conectado",
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
    findMyDog(
      dogs,
      sessionId,
    );

  const myTile =
    findDogTile(
      tiles,
      myDog,
    );

  const myBase =
    findMyBase(
      bases,
      sessionId,
    );

  function canMoveTo(
    tile: TileView,
  ) {
    return canMoveToTile({
      tile,

      origin:
        myTile,

      isMyTurn,

      playerCount:
        players.length,
    });
  }

  return {
    // Connection
    status,
    roomId,
    sessionId,

    // Synced state
    players,
    tiles,
    dogs,
    bases,

    // Player-derived state
    myDog,
    myTile,
    myBase,

    // Turn state
    currentPlayerId,
    turnNumber,
    isMyTurn,

    // Commands
    connect,
    endTurn,
    moveTo,

    // Rules
    canMoveTo,
  };
}