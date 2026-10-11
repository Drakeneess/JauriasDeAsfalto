import type {
  GameRoomState,
} from "./types.js";

export type TurnAdvanceResult = {
  turnNumber: number;
  currentPlayerId: string;
};

export function getTurnRejectionReason(
  state: GameRoomState,
  turnOrder: string[],
  playerId: string,
): string | null {
  if (
    playerId !==
    state.currentPlayerId
  ) {
    return (
      `${playerId} tried to play out of turn`
    );
  }

  if (
    turnOrder.length < 2
  ) {
    return (
      "waiting for second player"
    );
  }

  return null;
}

export function advanceTurn(
  state: GameRoomState,
  turnOrder: string[],
): TurnAdvanceResult | null {
  if (
    turnOrder.length < 2
  ) {
    return null;
  }

  const currentIndex =
    turnOrder.indexOf(
      state.currentPlayerId,
    );

  if (
    currentIndex === -1
  ) {
    state.currentPlayerId =
      turnOrder[0];

    return null;
  }

  const nextIndex =
    (
      currentIndex + 1
    ) %
    turnOrder.length;

  state.currentPlayerId =
    turnOrder[nextIndex];

  state.turnNumber += 1;

  return {
    turnNumber:
      state.turnNumber,

    currentPlayerId:
      state.currentPlayerId,
  };
}