import type {
  DogView,
  TileView,
} from "../types/game";

type Props = {
  tiles: TileView[];
  dogs: DogView[];

  sessionId:
    string | null;

  canMoveTo: (
    tile: TileView,
  ) => boolean;

  onMove: (
    tileId: string,
  ) => void;
};

export function GameBoard({
  tiles,
  dogs,
  sessionId,
  canMoveTo,
  onMove,
}: Props) {
  const sortedTiles =
    [...tiles].sort(
      (a, b) =>
        a.y - b.y ||
        a.x - b.x,
    );

  return (
    <section className="panel board-panel">
      <header className="board-header">
        <div>
          <h2 className="board-title">
            Mapa
          </h2>

          <div className="board-subtitle">
            Muévete a una zona adyacente
          </div>
        </div>
      </header>

      <div className="game-board">
        {sortedTiles.map(
          (tile) => {
            const dogsHere =
              dogs.filter(
                (dog) =>
                  dog.tileId ===
                  tile.id,
              );

            const canMove =
              canMoveTo(
                tile,
              );

            const hasSelf =
              dogsHere.some(
                (dog) =>
                  dog.ownerId ===
                  sessionId,
              );

            const hasEnemy =
              dogsHere.some(
                (dog) =>
                  dog.ownerId !==
                  sessionId,
              );

            const className = [
              "tile",
              canMove
                ? "tile--movable"
                : "",
              hasSelf
                ? "tile--self"
                : "",
              hasEnemy
                ? "tile--enemy"
                : "",
            ]
              .filter(Boolean)
              .join(" ");

            return (
              <button
                key={
                  tile.id
                }
                className={
                  className
                }
                onClick={() =>
                  onMove(
                    tile.id,
                  )
                }
                disabled={
                  !canMove
                }
              >
                <div className="tile-coordinates">
                  Zona {tile.x},{tile.y}
                </div>

                <div className="tile-dogs">
                  {dogsHere.map(
                    (dog) => {
                      const isSelf =
                        dog.ownerId ===
                        sessionId;

                      return (
                        <div
                          key={
                            dog.id
                          }
                          className={[
                            "dog-chip",
                            isSelf
                              ? "dog-chip--self"
                              : "dog-chip--enemy",
                          ].join(" ")}
                        >
                          🐕{" "}
                          {isSelf
                            ? "Tú"
                            : "Rival"}
                        </div>
                      );
                    },
                  )}
                </div>
              </button>
            );
          },
        )}
      </div>
    </section>
  );
}