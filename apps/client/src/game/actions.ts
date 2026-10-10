import type { Room } from "@colyseus/sdk";

export function sendEndTurn(
  room: Room,
) {
  room.send(
    "game_action",
    {
      type: "END_TURN",
    },
  );
}

export function sendMove(
  room: Room,
  destination: string,
) {
  room.send(
    "game_action",
    {
      type: "MOVE",
      destination,
    },
  );
}