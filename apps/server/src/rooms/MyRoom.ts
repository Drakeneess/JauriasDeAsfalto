import {
  Room,
  type Client,
} from "@colyseus/core";

import {
  MyRoomState,
  TileState,
} from "./schema/MyRoomState.js";

import {
  parseGameAction,
  type GameAction,
} from "../game/actions.js";

import {
  createMap,
} from "../game/map.js";

import {
  addPlayer,
  removePlayer,
} from "../game/players.js";

import {
  moveDog,
} from "../game/movement.js";

import {
  advanceTurn,
  getTurnRejectionReason,
} from "../game/turns.js";

import {
  createPrivatePois,
  type PrivatePoi,
} from "../game/poi.js";

export class MyRoom extends Room {
  maxClients = 2;

  state =
    new MyRoomState();

  private turnOrder:
  string[] = [];

  private pois =
    new Map<
      string,
      PrivatePoi
    >();

  onCreate() {
    this.initializeState();
    this.initializeMap();
    this.initializePois();
    this.registerMessages();

    console.log(
      "[MyRoom] created",
    );
  }

  onJoin(
    client: Client,
  ) {
    const player =
      addPlayer(
        this.state,
        this.turnOrder,
        client.sessionId,
      );

    console.log(
      `[MyRoom] joined: ${client.sessionId}`,
    );

    console.log(
      `[MyRoom] players: ${this.state.players.size}`,
    );

    console.log(
      `[MyRoom] current turn: ${this.state.currentPlayerId}`,
    );

    console.log(
      `[Dog] ${player.dogId} spawned at ${player.dogTileId}`,
    );

    console.log(
      `[Base] ${player.baseId} created with ${player.baseFood} food`,
    );
  }

  onLeave(
    client: Client,
  ) {
    this.turnOrder =
      removePlayer(
        this.state,
        this.turnOrder,
        client.sessionId,
      );

    console.log(
      `[MyRoom] left: ${client.sessionId}`,
    );

    console.log(
      `[MyRoom] players: ${this.state.players.size}`,
    );

    console.log(
      `[MyRoom] current turn: ${this.state.currentPlayerId}`,
    );
  }

  private initializeState() {
    this.state.currentPlayerId =
      "";

    this.state.turnNumber =
      1;
  }

  private initializeMap() {
    const map =
      createMap();

    for (
      const tileData
      of map
    ) {
      const tile =
        new TileState();

      tile.id =
        tileData.id;

      tile.x =
        tileData.x;

      tile.y =
        tileData.y;

      this.state.tiles.set(
        tile.id,
        tile,
      );
    }

    console.log(
      `[Map] created with ${this.state.tiles.size} tiles`,
    );
  }

  private initializePois() {
    const tileIds =
      Array.from(
        this.state.tiles.keys(),
      );

    this.pois =
      createPrivatePois(
        tileIds,
      );

    console.log(
      `[POI] ${this.pois.size} private POIs generated`,
    );
  }

  private getPoiAt(
    tileId: string,
  ) {
    return (
      this.pois.get(
        tileId,
      ) ?? null
    );
  }

  private registerMessages() {
    this.onMessage(
      "game_action",
      (
        client,
        payload: unknown,
      ) => {
        const action =
          parseGameAction(
            payload,
          );

        if (!action) {
          console.log(
            `[Action] rejected invalid payload from ${client.sessionId}`,
          );

          return;
        }

        this.handleAction(
          client,
          action,
        );
      },
    );
  }

  private handleAction(
    client: Client,
    action: GameAction,
  ) {
    console.log(
      `[Action] ${client.sessionId} -> ${action.type}`,
    );

    const rejectionReason =
      getTurnRejectionReason(
        this.state,
        this.turnOrder,
        client.sessionId,
      );

    if (
      rejectionReason
    ) {
      const scope =
        action.type === "MOVE"
          ? "Move"
          : "Turn";

      console.log(
        `[${scope}] rejected: ${rejectionReason}`,
      );

      return;
    }

    switch (
      action.type
    ) {
      case "END_TURN":
        this.finishTurn();
        break;

      case "MOVE":
        this.handleMove(
          client,
          action.destination,
        );
        break;
    }
  }

  private handleMove(
    client: Client,
    destinationId: string,
  ) {
    const result =
      moveDog(
        this.state,
        client.sessionId,
        destinationId,
      );

    if (result.ok === false) {
      console.log(
        `[Move] rejected: ${result.reason}`,
      );

      return;
    }

    console.log(
      `[Move] ${client.sessionId}: ${result.previousTileId} -> ${result.destinationId}`,
    );

    this.finishTurn();
  }

  private finishTurn() {
    const result =
      advanceTurn(
        this.state,
        this.turnOrder,
      );

    if (!result) {
      return;
    }

    console.log(
      `[Turn] ${result.turnNumber} -> ${result.currentPlayerId}`,
    );
  }
}