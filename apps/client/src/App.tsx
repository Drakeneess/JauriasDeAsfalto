import {
  GameBoard,
} from "./components/GameBoard";

import {
  GameHud,
} from "./components/GameHud";

import {
  useGameRoom,
} from "./hooks/useGameRoom";

function App() {
  const game =
    useGameRoom();

  return (
    <main>
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
    </main>
  );
}

export default App;