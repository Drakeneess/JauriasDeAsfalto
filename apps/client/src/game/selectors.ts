import type {
  BaseView,
  DogView,
  TileView,
} from "../types/game";

export function findMyDog(
  dogs: DogView[],
  sessionId:
    string | null,
) {
  if (!sessionId) {
    return undefined;
  }

  return dogs.find(
    (dog) =>
      dog.ownerId ===
      sessionId,
  );
}

export function findMyBase(
  bases: BaseView[],
  sessionId:
    string | null,
) {
  if (!sessionId) {
    return undefined;
  }

  return bases.find(
    (base) =>
      base.ownerId ===
      sessionId,
  );
}

export function findDogTile(
  tiles: TileView[],
  dog:
    DogView | undefined,
) {
  if (!dog) {
    return undefined;
  }

  return tiles.find(
    (tile) =>
      tile.id ===
      dog.tileId,
  );
}

type CanMoveToTileOptions = {
  tile: TileView;

  origin:
    TileView | undefined;

  isMyTurn: boolean;

  playerCount: number;
};

export function canMoveToTile({
  tile,
  origin,
  isMyTurn,
  playerCount,
}: CanMoveToTileOptions) {
  if (
    !isMyTurn ||
    playerCount < 2 ||
    !origin
  ) {
    return false;
  }

  const distance =
    Math.abs(
      origin.x -
        tile.x,
    ) +
    Math.abs(
      origin.y -
        tile.y,
    );

  return distance === 1;
}