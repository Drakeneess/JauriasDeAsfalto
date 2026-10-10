export type EndTurnAction = {
  type: "END_TURN";
};

export type GameAction =
  | EndTurnAction;

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

  return null;
}