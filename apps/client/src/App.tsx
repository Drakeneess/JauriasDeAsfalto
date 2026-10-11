import {
  GameBoard,
} from "./components/GameBoard";

import {
  GameHud,
} from "./components/GameHud";

import {
  useGameRoom,
} from "./hooks/useGameRoom";

import "./styles/game.css";

function App() {
  const game =
    useGameRoom();

  const isConnected =
    game.status ===
    "Conectado";

  if (!isConnected) {
    return (
      <main className="game-shell">
        <section className="panel lobby">
          <h1 className="game-title">
            Jaurías de Asfalto
          </h1>

          <p>
            Conéctate para entrar
            a una partida.
          </p>

          <button
            className="button button-primary"
            onClick={
              game.connect
            }
            disabled={
              game.status ===
              "Conectando..."
            }
          >
            {game.status ===
            "Conectando..."
              ? "Conectando..."
              : "Entrar"}
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="game-shell">
      <div className="game-layout">
        <GameHud
          status={
            game.status
          }
          roomId={
            game.roomId
          }
          sessionId={
            game.sessionId
          }
          players={
            game.players
          }
          turnNumber={
            game.turnNumber
          }
          isMyTurn={
            game.isMyTurn
          }
          food={
            game.myBase?.food ?? 0
          }
          onConnect={
            game.connect
          }
          onEndTurn={
            game.endTurn
          }
        />

        <GameBoard
          tiles={
            game.tiles
          }
          dogs={
            game.dogs
          }
          discoveredPois={
            game.discoveredPois
          }
          sessionId={
            game.sessionId
          }
          canMoveTo={
            game.canMoveTo
          }
          onMove={
            game.moveTo
          }
        />
      </div>
    </main>
  );
}

export default App;