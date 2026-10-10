import type {
  ConnectionStatus,
  PlayerView,
} from "../types/game";

type Props = {
  status: ConnectionStatus;

  roomId: string | null;
  sessionId: string | null;

  players: PlayerView[];

  turnNumber: number;
  isMyTurn: boolean;
  food: number;

  onConnect: () => void;
  onEndTurn: () => void;
};

export function GameHud({
  status,
  roomId,
  sessionId,
  players,
  turnNumber,
  isMyTurn,
  food,
  onEndTurn,
}: Props) {
  const statusClass =
    status === "Conectado"
      ? "status-badge--connected"
      : status === "Conectando..."
        ? "status-badge--connecting"
        : status === "Error de conexión"
          ? "status-badge--error"
          : "";

  return (
    <aside className="panel">
      <h1 className="game-title">
        Jaurías de Asfalto
      </h1>

      <div
        className={`status-badge ${statusClass}`}
      >
        {status}
      </div>

      <div className="section-title">
        Partida
      </div>

      <div className="meta-list">
        <div>
          Room:{" "}
          <span className="meta-value">
            {roomId}
          </span>
        </div>

        <div>
          Session:{" "}
          <span className="meta-value">
            {sessionId}
          </span>
        </div>
      </div>

      <div className="section-title">
        Base
      </div>

      <div className="resource-card">
        <span>
          🍖 Comida
        </span>

        <strong>
          {food}
        </strong>
      </div>

      <div className="section-title">
        Jugadores
      </div>

      <div className="player-list">
        {players.map(
          (player) => {
            const isSelf =
              player.id ===
              sessionId;

            return (
              <div
                key={player.id}
                className={[
                  "player-row",
                  isSelf
                    ? "player-row--self"
                    : "",
                ].join(" ")}
              >
                <span className="player-label">
                  {player.id}
                </span>

                {isSelf && (
                  <span className="player-tag">
                    Tú
                  </span>
                )}
              </div>
            );
          },
        )}
      </div>

      <div
        className={[
          "turn-card",
          isMyTurn
            ? "turn-card--active"
            : "",
        ].join(" ")}
      >
        <div className="turn-number">
          Turno {turnNumber}
        </div>

        <div className="turn-state">
          {isMyTurn
            ? "Es tu turno"
            : "Turno del rival"}
        </div>
      </div>

      <button
        className="button button-secondary"
        onClick={
          onEndTurn
        }
        disabled={
          !isMyTurn ||
          players.length < 2
        }
        style={{
          marginTop: 12,
        }}
      >
        Terminar turno
      </button>
    </aside>
  );
}