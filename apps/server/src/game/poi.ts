export type PoiType =
  | "BUTCHER_SHOP"
  | "DUMPSTER"
  | "MARKET";

export type PrivatePoi = {
  id: string;
  type: PoiType;
  tileId: string;
};

const POI_TYPES: PoiType[] = [
  "BUTCHER_SHOP",
  "DUMPSTER",
  "MARKET",
];

export function createPrivatePois(
  tileIds: string[],
): Map<string, PrivatePoi> {
  const availableTiles =
    tileIds.filter(
      (tileId) =>
        tileId !== "tile-0-0" &&
        tileId !== "tile-2-2",
    );

  const shuffled =
    [...availableTiles].sort(
      () => Math.random() - 0.5,
    );

  const pois =
    new Map<
      string,
      PrivatePoi
    >();

  POI_TYPES.forEach(
    (type, index) => {
      const tileId =
        shuffled[index];

      if (!tileId) {
        return;
      }

      const poi: PrivatePoi = {
        id:
          `poi-${type.toLowerCase()}-${index}`,
        type,
        tileId,
      };

      pois.set(
        tileId,
        poi,
      );
    },
  );

  return pois;
}