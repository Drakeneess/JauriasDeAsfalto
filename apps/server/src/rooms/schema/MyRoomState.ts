import { schema, t } from "@colyseus/schema";

export const PlayerState = schema(
  {
    id: t.string(),
    connected: t.boolean(),
  },
  "PlayerState",
);

export const DogState = schema(
  {
    id: t.string(),
    ownerId: t.string(),
    tileId: t.string(),
  },
  "DogState",
);

export const BaseState = schema(
  {
    id: t.string(),
    ownerId: t.string(),
    food: t.number(),
  },
  "BaseState",
);

export const TileState = schema(
  {
    id: t.string(),
    x: t.number(),
    y: t.number(),
  },
  "TileState",
);

export const MyRoomState = schema(
  {
    players: t.map(PlayerState),
    dogs: t.map(DogState),
    bases: t.map(BaseState),
    tiles: t.map(TileState),

    currentPlayerId: t.string(),
    turnNumber: t.number(),
  },
  "MyRoomState",
);