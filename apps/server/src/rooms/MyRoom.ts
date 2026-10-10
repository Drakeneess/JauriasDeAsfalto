import { Room, type Client } from "@colyseus/core";

import {
  DogState,
  MyRoomState,
  PlayerState,
  TileState,
} from "./schema/MyRoomState.js";

import {
  parseGameAction,
  type GameAction,
} from "../game/actions.js";

import { createMap } from "../game/map.js";

export class MyRoom extends Room {
  maxClients = 2;

  state = new MyRoomState();

  private turnOrder: string[] = [];

  onCreate() {
    this.state.currentPlayerId = "";
    this.state.turnNumber = 1;

    const map = createMap();

    for (const tileData of map) {
      const tile = new TileState();

      tile.id = tileData.id;
      tile.x = tileData.x;
      tile.y = tileData.y;

      this.state.tiles.set(
        tile.id,
        tile,
      );
    }

    console.log(
      `[Map] created with ${this.state.tiles.size} tiles`,
    );

    this.onMessage(
      "game_action",
      (
        client,
        payload: unknown,
      ) => {
        const action =
          parseGameAction(payload);

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

    console.log("[MyRoom] created");
  }

  onJoin(client: Client) {
    const player =
      new PlayerState();

    player.id =
      client.sessionId;

    player.connected = true;

    this.state.players.set(
      client.sessionId,
      player,
    );

    this.turnOrder.push(
      client.sessionId,
    );

    const dog =
      new DogState();

    dog.id =
      `dog-${client.sessionId}`;

    dog.ownerId =
      client.sessionId;

    dog.tileId =
      this.getStartingTileId();

    this.state.dogs.set(
      client.sessionId,
      dog,
    );

    if (
      this.turnOrder.length === 1
    ) {
      this.state.currentPlayerId =
        client.sessionId;
    }

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
      `[Dog] ${dog.id} spawned at ${dog.tileId}`,
    );
  }

  onLeave(client: Client) {
    this.state.players.delete(
      client.sessionId,
    );

    this.state.dogs.delete(
      client.sessionId,
    );

    this.turnOrder =
      this.turnOrder.filter(
        (playerId) =>
          playerId !==
          client.sessionId,
      );

    if (
      this.state.currentPlayerId ===
      client.sessionId
    ) {
      this.state.currentPlayerId =
        this.turnOrder[0] ?? "";
    }

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

  private handleAction(
    client: Client,
    action: GameAction,
  ) {
    console.log(
      `[Action] ${client.sessionId} -> ${action.type}`,
    );

    switch (action.type) {
      case "END_TURN":
        this.endTurn(client);
        break;

      case "MOVE":
        this.moveDog(
          client,
          action.destination,
        );
        break;
    }
  }

  private endTurn(
    client: Client,
  ) {
    if (
      client.sessionId !==
      this.state.currentPlayerId
    ) {
      console.log(
        `[Turn] rejected: ${client.sessionId} tried to play out of turn`,
      );

      return;
    }

    if (
      this.turnOrder.length < 2
    ) {
      console.log(
        "[Turn] rejected: waiting for second player",
      );

      return;
    }

    this.advanceTurn();
  }

  private advanceTurn() {
    if (
      this.turnOrder.length < 2
    ) {
      return;
    }

    const currentIndex =
      this.turnOrder.indexOf(
        this.state.currentPlayerId,
      );

    if (currentIndex === -1) {
      this.state.currentPlayerId =
        this.turnOrder[0];

      return;
    }

    const nextIndex =
      (currentIndex + 1) %
      this.turnOrder.length;

    this.state.currentPlayerId =
      this.turnOrder[nextIndex];

    this.state.turnNumber += 1;

    console.log(
      `[Turn] ${this.state.turnNumber} -> ${this.state.currentPlayerId}`,
    );
  }

  private getStartingTileId() {
    const startingTiles = [
      "tile-0-0",
      "tile-2-2",
    ];

    for (
      const tileId
      of startingTiles
    ) {
      let occupied = false;

      this.state.dogs.forEach(
        (dog) => {
          if (
            dog.tileId === tileId
          ) {
            occupied = true;
          }
        },
      );

      if (!occupied) {
        return tileId;
      }
    }

    return "tile-1-1";
  }

  private moveDog(
    client: Client,
    destinationId: string,
  ) {
    if (
      client.sessionId !==
      this.state.currentPlayerId
    ) {
      console.log(
        `[Move] rejected: ${client.sessionId} is out of turn`,
      );

      return;
    }

    if (
      this.turnOrder.length < 2
    ) {
      console.log(
        "[Move] rejected: waiting for second player",
      );

      return;
    }

    const dog =
      this.state.dogs.get(
        client.sessionId,
      );

    if (!dog) {
      console.log(
        `[Move] rejected: dog not found for ${client.sessionId}`,
      );

      return;
    }

    const origin =
      this.state.tiles.get(
        dog.tileId,
      );

    const destination =
      this.state.tiles.get(
        destinationId,
      );

    if (
      !origin ||
      !destination
    ) {
      console.log(
        `[Move] rejected: invalid destination ${destinationId}`,
      );

      return;
    }

    const distance =
      Math.abs(
        origin.x -
        destination.x,
      ) +
      Math.abs(
        origin.y -
        destination.y,
      );

    if (
      distance !== 1
    ) {
      console.log(
        `[Move] rejected: ${dog.tileId} -> ${destinationId} is not adjacent`,
      );

      return;
    }

    const previousTileId =
      dog.tileId;

    dog.tileId =
      destinationId;

    console.log(
      `[Move] ${client.sessionId}: ${previousTileId} -> ${destinationId}`,
    );

    this.advanceTurn();
  }
}