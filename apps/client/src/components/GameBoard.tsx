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
    <>
      <h2>
        Mapa
      </h2>

      <div
        style={{
          display:
            "grid",
          gridTemplateColumns:
            "repeat(3, 100px)",
          gap: "8px",
        }}
      >
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

            return (
              <button
                key={
                  tile.id
                }
                onClick={() =>
                  onMove(
                    tile.id,
                  )
                }
                disabled={
                  !canMove
                }
                style={{
                  width: 100,
                  height: 100,

                  display:
                    "flex",

                  flexDirection:
                    "column",

                  alignItems:
                    "center",

                  justifyContent:
                    "center",

                  gap: "6px",

                  cursor:
                    canMove
                      ? "pointer"
                      : "default",
                }}
              >
                <div>
                  {tile.x},
                  {tile.y}
                </div>

                {dogsHere.map(
                  (dog) => (
                    <div
                      key={
                        dog.id
                      }
                    >
                      🐕{" "}

                      {dog.ownerId ===
                      sessionId
                        ? "Tú"
                        : "Rival"}
                    </div>
                  ),
                )}
              </button>
            );
          },
        )}
      </div>
    </>
  );
}