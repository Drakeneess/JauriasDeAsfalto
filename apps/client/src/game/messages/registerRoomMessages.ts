import type {
  Dispatch,
  SetStateAction,
} from "react";

import type {
  Room,
} from "@colyseus/sdk";

import type {
  DiscoveredPoiView,
  PoiType,
} from "../../types/game";

type StateSetter<T> =
  Dispatch<
    SetStateAction<T>
  >;

type RoomMessageOptions = {
  setDiscoveredPois:
    StateSetter<
      DiscoveredPoiView[]
    >;
};

const POI_TYPES:
  PoiType[] = [
    "BUTCHER_SHOP",
    "DUMPSTER",
    "MARKET",
  ];

function isPoiType(
  value: unknown,
): value is PoiType {
  return (
    typeof value ===
      "string" &&
    POI_TYPES.includes(
      value as PoiType,
    )
  );
}

function parseDiscoveredPoi(
  value: unknown,
):
  | DiscoveredPoiView
  | null {
  if (
    typeof value !==
      "object" ||
    value === null
  ) {
    return null;
  }

  const data =
    value as Record<
      string,
      unknown
    >;

  if (
    typeof data.id !==
      "string" ||
    typeof data.tileId !==
      "string" ||
    !isPoiType(
      data.type,
    )
  ) {
    return null;
  }

  return {
    id:
      data.id,

    type:
      data.type,

    tileId:
      data.tileId,
  };
}

export function registerRoomMessages(
  room: Room,
  {
    setDiscoveredPois,
  }: RoomMessageOptions,
) {
  room.onMessage(
    "poi_discovered",
    (
      payload: unknown,
    ) => {
      const poi =
        parseDiscoveredPoi(
          payload,
        );

      if (!poi) {
        console.error(
          "[Client] invalid POI discovery payload",
          payload,
        );

        return;
      }

      console.log(
        "[Client] POI discovered:",
        poi.type,
      );

      setDiscoveredPois(
        (current) => [
          ...current.filter(
            (item) =>
              item.id !==
              poi.id,
          ),
          poi,
        ],
      );
    },
  );
}