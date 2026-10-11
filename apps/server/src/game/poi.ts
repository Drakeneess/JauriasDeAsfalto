export type PoiType =
  | "BUTCHER_SHOP"
  | "DUMPSTER"
  | "MARKET";

export type PrivatePoi = {
  id: string;
  type: PoiType;
  tileId: string;
};

export type RevealedPoi = {
  id: string;
  type: PoiType;
  tileId: string;
};

export type PlayerPoiDiscoveries =
  Map<string, Set<string>>;

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

export function registerPlayerDiscoveries(
  discoveries:
    PlayerPoiDiscoveries,
  playerId: string,
) {
  discoveries.set(
    playerId,
    new Set(),
  );
}

export function removePlayerDiscoveries(
  discoveries:
    PlayerPoiDiscoveries,
  playerId: string,
) {
  discoveries.delete(
    playerId,
  );
}

export function discoverPoiAt(
  pois:
    Map<string, PrivatePoi>,

  discoveries:
    PlayerPoiDiscoveries,

  playerId: string,

  tileId: string,
): RevealedPoi | null {
  const poi =
    pois.get(
      tileId,
    );

  if (!poi) {
    return null;
  }

  let playerDiscoveries =
    discoveries.get(
      playerId,
    );

  if (!playerDiscoveries) {
    playerDiscoveries =
      new Set<string>();

    discoveries.set(
      playerId,
      playerDiscoveries,
    );
  }

  if (
    playerDiscoveries.has(
      poi.id,
    )
  ) {
    return null;
  }

  playerDiscoveries.add(
    poi.id,
  );

  return {
    id:
      poi.id,

    type:
      poi.type,

    tileId:
      poi.tileId,
  };
}