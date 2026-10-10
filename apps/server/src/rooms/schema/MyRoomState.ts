import { schema, t } from "@colyseus/schema";

export const PlayerState = schema(
  {
    id: t.string(),
    connected: t.boolean(),
  },
  "PlayerState",
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

    tiles: t.map(TileState),

    currentPlayerId: t.string(),
    turnNumber: t.number(),
  },
  "MyRoomState",
);