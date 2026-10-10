import type {
  Dispatch,
  SetStateAction,
} from "react";

import {
  Callbacks,
  type Room,
} from "@colyseus/sdk";

import type {
  BaseView,
  DogView,
  PlayerView,
  TileView,
} from "../../types/game";

type StateSetter<T> =
  Dispatch<SetStateAction<T>>;

type RoomSyncOptions = {
  setPlayers:
    StateSetter<PlayerView[]>;

  setTiles:
    StateSetter<TileView[]>;

  setDogs:
    StateSetter<DogView[]>;

  setBases:
    StateSetter<BaseView[]>;

  setCurrentPlayerId:
    StateSetter<string>;

  setTurnNumber:
    StateSetter<number>;

  onLeave:
    () => void;
};

type SyncedDog =
  DogView & object;

type SyncedBase =
  BaseView & object;

function upsertById<
  T extends { id: string },
>(
  current: T[],
  next: T,
) {
  return [
    ...current.filter(
      (item) =>
        item.id !== next.id,
    ),
    next,
  ];
}

export function registerRoomCallbacks(
  room: Room,
  {
    setPlayers,
    setTiles,
    setDogs,
    setBases,
    setCurrentPlayerId,
    setTurnNumber,
    onLeave,
  }: RoomSyncOptions,
) {
  registerPlayers(
    room,
    setPlayers,
  );

  registerTiles(
    room,
    setTiles,
  );

  registerDogs(
    room,
    setDogs,
  );

  registerBases(
    room,
    setBases,
  );

  const callbacks =
    Callbacks.get(room);

  callbacks.listen(
    "currentPlayerId",
    (
      value: string,
    ) => {
      setCurrentPlayerId(
        value,
      );
    },
  );

  callbacks.listen(
    "turnNumber",
    (
      value: number,
    ) => {
      setTurnNumber(
        value,
      );
    },
  );

  room.onLeave(
    (code) => {
      console.log(
        "[Client] left room:",
        code,
      );

      onLeave();
    },
  );

  room.onError(
    (
      code,
      message,
    ) => {
      console.error(
        "[Client] room error:",
        code,
        message,
      );
    },
  );
}

function registerPlayers(
  room: Room,
  setPlayers:
    StateSetter<PlayerView[]>,
) {
  const callbacks =
    Callbacks.get(room);

  callbacks.onAdd(
    "players",
    (
      player,
      playerId,
    ) => {
      const typedPlayer =
        player as PlayerView;

      const id =
        String(playerId);

      setPlayers(
        (current) =>
          upsertById(
            current,
            {
              id,
              connected:
                typedPlayer.connected,
            },
          ),
      );
    },
  );

  callbacks.onRemove(
    "players",
    (
      _player,
      playerId,
    ) => {
      const id =
        String(playerId);

      setPlayers(
        (current) =>
          current.filter(
            (item) =>
              item.id !== id,
          ),
      );
    },
  );
}

function registerTiles(
  room: Room,
  setTiles:
    StateSetter<TileView[]>,
) {
  const callbacks =
    Callbacks.get(room);

  callbacks.onAdd(
    "tiles",
    (
      tile,
      tileId,
    ) => {
      const typedTile =
        tile as TileView;

      const id =
        String(tileId);

      setTiles(
        (current) =>
          upsertById(
            current,
            {
              id,
              x: typedTile.x,
              y: typedTile.y,
            },
          ),
      );
    },
  );

  callbacks.onRemove(
    "tiles",
    (
      _tile,
      tileId,
    ) => {
      const id =
        String(tileId);

      setTiles(
        (current) =>
          current.filter(
            (item) =>
              item.id !== id,
          ),
      );
    },
  );
}

function registerDogs(
  room: Room,
  setDogs:
    StateSetter<DogView[]>,
) {
  const callbacks =
    Callbacks.get(room);

  callbacks.onAdd(
    "dogs",
    (
      dog,
      dogKey,
    ) => {
      const typedDog =
        dog as SyncedDog;

      const ownerId =
        String(dogKey);

      const id =
        typedDog.id ||
        `dog-${ownerId}`;

      setDogs(
        (current) =>
          upsertById(
            current,
            {
              id,
              ownerId:
                typedDog.ownerId ||
                ownerId,
              tileId:
                typedDog.tileId,
            },
          ),
      );

      callbacks.onChange(
        typedDog,
        () => {
          const tileId =
            String(
              typedDog.tileId,
            );

          setDogs(
            (current) =>
              current.map(
                (item) =>
                  item.id === id
                    ? {
                        ...item,
                        tileId,
                      }
                    : item,
              ),
          );
        },
      );
    },
  );

  callbacks.onRemove(
    "dogs",
    (
      _dog,
      dogKey,
    ) => {
      const ownerId =
        String(dogKey);

      setDogs(
        (current) =>
          current.filter(
            (item) =>
              item.ownerId !==
              ownerId,
          ),
      );
    },
  );
}

function registerBases(
  room: Room,
  setBases:
    StateSetter<BaseView[]>,
) {
  const callbacks =
    Callbacks.get(room);

  callbacks.onAdd(
    "bases",
    (
      base,
      baseKey,
    ) => {
      const typedBase =
        base as SyncedBase;

      const ownerId =
        String(baseKey);

      const id =
        typedBase.id ||
        `base-${ownerId}`;

      setBases(
        (current) =>
          upsertById(
            current,
            {
              id,
              ownerId:
                typedBase.ownerId ||
                ownerId,
              food:
                typedBase.food,
            },
          ),
      );

      callbacks.onChange(
        typedBase,
        () => {
          setBases(
            (current) =>
              current.map(
                (item) =>
                  item.id === id
                    ? {
                        ...item,
                        food:
                          typedBase.food,
                      }
                    : item,
              ),
          );
        },
      );
    },
  );

  callbacks.onRemove(
    "bases",
    (
      _base,
      baseKey,
    ) => {
      const ownerId =
        String(baseKey);

      setBases(
        (current) =>
          current.filter(
            (item) =>
              item.ownerId !==
              ownerId,
          ),
      );
    },
  );
}