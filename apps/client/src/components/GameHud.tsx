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
  onConnect,
  onEndTurn,
}: Props) {
  const canPlay =
    players.length >= 2;

  return (
    <>
      <h1>
        Jaurías de Asfalto
      </h1>

      <p>
        Estado: {status}
      </p>

      {roomId && (
        <p>
          Room: {roomId}
        </p>
      )}

      {sessionId && (
        <p>
          Session: {sessionId}
        </p>
      )}

      <button
        onClick={
          onConnect
        }
        disabled={
          status ===
            "Conectado" ||
          status ===
            "Conectando..."
        }
      >
        Conectar
      </button>

      <h2>
        Jugadores
      </h2>

      {players.map(
        (player) => (
          <div
            key={
              player.id
            }
          >
            {player.id}

            {player.id ===
            sessionId
              ? " ← Tú"
              : ""}
          </div>
        ),
      )}

      <h2>
        Turno {turnNumber}
      </h2>

      <p>
        {isMyTurn
          ? "Es tu turno"
          : "Turno del otro jugador"}
      </p>

      <button
        onClick={
          onEndTurn
        }
        disabled={
          !isMyTurn ||
          !canPlay
        }
      >
        Terminar turno
      </button>
    </>
  );
}