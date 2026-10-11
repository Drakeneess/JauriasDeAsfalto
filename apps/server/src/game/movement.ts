import type {
  GameRoomState,
} from "./types.js";

export type MoveDogResult =
  | {
      ok: true;

      previousTileId:
        string;

      destinationId:
        string;
    }
  | {
      ok: false;

      reason:
        string;
    };

export function moveDog(
  state: GameRoomState,
  playerId: string,
  destinationId: string,
): MoveDogResult {
  const dog =
    state.dogs.get(
      playerId,
    );

  if (!dog) {
    return {
      ok: false,

      reason:
        `dog not found for ${playerId}`,
    };
  }

  const origin =
    state.tiles.get(
      dog.tileId,
    );

  const destination =
    state.tiles.get(
      destinationId,
    );

  if (
    !origin ||
    !destination
  ) {
    return {
      ok: false,

      reason:
        `invalid destination ${destinationId}`,
    };
  }

  const distance =
    Math.abs(
      origin.x -
        destination.x,
    ) +
    Math.abs(
      origin.y -
        destination.y,
    );

  if (
    distance !== 1
  ) {
    return {
      ok: false,

      reason:
        `${dog.tileId} -> ${destinationId} is not adjacent`,
    };
  }

  const previousTileId =
    dog.tileId;

  dog.tileId =
    destinationId;

  return {
    ok: true,

    previousTileId,

    destinationId,
  };
}