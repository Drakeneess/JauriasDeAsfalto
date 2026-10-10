export type EndTurnAction = {
  type: "END_TURN";
};

export type MoveAction = {
  type: "MOVE";
  destination: string;
};

export type GameAction =
  | EndTurnAction
  | MoveAction;

export function parseGameAction(
  value: unknown,
): GameAction | null {
  if (
    typeof value !== "object" ||
    value === null
  ) {
    return null;
  }

  const action =
    value as Record<string, unknown>;

  if (action.type === "END_TURN") {
    return {
      type: "END_TURN",
    };
  }

  if (
    action.type === "MOVE" &&
    typeof action.destination === "string"
  ) {
    return {
      type: "MOVE",
      destination: action.destination,
    };
  }

  return null;
}
