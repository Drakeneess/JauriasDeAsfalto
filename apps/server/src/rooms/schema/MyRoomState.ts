import { schema, t } from "@colyseus/schema";

export const PlayerState = schema(
  {
    id: t.string(),
    connected: t.boolean(),
  },
  "PlayerState",
);

export const MyRoomState = schema(
  {
    players: t.map(PlayerState),

    currentPlayerId: t.string(),
    turnNumber: t.number(),
  },
  "MyRoomState",
);