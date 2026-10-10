import { Room, type Client } from "@colyseus/core";

import {
  MyRoomState,
  PlayerState,
} from "./schema/MyRoomState.js";

import {
  parseGameAction,
  type GameAction,
} from "../game/actions.js";

export class MyRoom extends Room {
  maxClients = 2;

  state = new MyRoomState();

  private turnOrder: string[] = [];

  onCreate() {
    this.state.currentPlayerId = "";
    this.state.turnNumber = 1;

    this.onMessage(
      "game_action",
      (client, payload: unknown) => {
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
    const player = new PlayerState();

    player.id = client.sessionId;
    player.connected = true;

    this.state.players.set(client.sessionId, player);
    this.turnOrder.push(client.sessionId);

    if (this.turnOrder.length === 1) {
      this.state.currentPlayerId = client.sessionId;
    }

    console.log(`[MyRoom] joined: ${client.sessionId}`);
    console.log(`[MyRoom] players: ${this.state.players.size}`);
    console.log(`[MyRoom] current turn: ${this.state.currentPlayerId}`);
  }

  onLeave(client: Client) {
    this.state.players.delete(client.sessionId);

    this.turnOrder = this.turnOrder.filter(
      (playerId) => playerId !== client.sessionId,
    );

    if (this.state.currentPlayerId === client.sessionId) {
      this.state.currentPlayerId = this.turnOrder[0] ?? "";
    }

    console.log(`[MyRoom] left: ${client.sessionId}`);
    console.log(`[MyRoom] players: ${this.state.players.size}`);
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
    }
  }

  private endTurn(client: Client) {
    if (client.sessionId !== this.state.currentPlayerId) {
      console.log(
        `[Turn] rejected: ${client.sessionId} tried to play out of turn`,
      );

      return;
    }

    if (this.turnOrder.length < 2) {
      return;
    }

    const currentIndex = this.turnOrder.indexOf(
      this.state.currentPlayerId,
    );

    const nextIndex =
      (currentIndex + 1) % this.turnOrder.length;

    this.state.currentPlayerId =
      this.turnOrder[nextIndex];

    this.state.turnNumber += 1;

    console.log(
      `[Turn] ${this.state.turnNumber} -> ${this.state.currentPlayerId}`,
    );
  }
}