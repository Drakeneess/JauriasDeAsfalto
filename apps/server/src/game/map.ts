export type MapTile = {
  id: string;
  x: number;
  y: number;
};

export function createMap(): MapTile[] {
  const tiles: MapTile[] = [];

  for (let y = 0; y < 3; y += 1) {
    for (let x = 0; x < 3; x += 1) {
      tiles.push({
        id: `tile-${x}-${y}`,
        x,
        y,
      });
    }
  }

  return tiles;
}