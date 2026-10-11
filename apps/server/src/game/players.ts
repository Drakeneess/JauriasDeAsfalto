import {
  BaseState,
  DogState,
  PlayerState,
} from "../rooms/schema/MyRoomState.js";

import type {
  GameRoomState,
} from "./types.js";

export type AddPlayerResult = {
  dogId: string;
  dogTileId: string;

  baseId: string;
  baseFood: number;
};

export function addPlayer(
  state: GameRoomState,
  turnOrder: string[],
  playerId: string,
): AddPlayerResult {
  const player =
    new PlayerState();

  player.id =
    playerId;

  player.connected =
    true;

  state.players.set(
    playerId,
    player,
  );

  turnOrder.push(
    playerId,
  );

  const dog =
    new DogState();

  dog.id =
    `dog-${playerId}`;

  dog.ownerId =
    playerId;

  dog.tileId =
    getStartingTileId(
      state,
    );

  state.dogs.set(
    playerId,
    dog,
  );

  const base =
    new BaseState();

  base.id =
    `base-${playerId}`;

  base.ownerId =
    playerId;

  base.food = 0;

  state.bases.set(
    playerId,
    base,
  );

  if (
    turnOrder.length === 1
  ) {
    state.currentPlayerId =
      playerId;
  }

  return {
    dogId:
      dog.id,

    dogTileId:
      dog.tileId,

    baseId:
      base.id,

    baseFood:
      base.food,
  };
}

export function removePlayer(
  state: GameRoomState,
  turnOrder: string[],
  playerId: string,
): string[] {
  state.players.delete(
    playerId,
  );

  state.dogs.delete(
    playerId,
  );

  state.bases.delete(
    playerId,
  );

  const nextTurnOrder =
    turnOrder.filter(
      (id) =>
        id !== playerId,
    );

  if (
    state.currentPlayerId ===
    playerId
  ) {
    state.currentPlayerId =
      nextTurnOrder[0] ?? "";
  }

  return nextTurnOrder;
}

function getStartingTileId(
  state: GameRoomState,
) {
  const startingTiles = [
    "tile-0-0",
    "tile-2-2",
  ];

  for (
    const tileId
    of startingTiles
  ) {
    let occupied =
      false;

    state.dogs.forEach(
      (dog) => {
        if (
          dog.tileId ===
          tileId
        ) {
          occupied =
            true;
        }
      },
    );

    if (!occupied) {
      return tileId;
    }
  }

  return "tile-1-1";
}