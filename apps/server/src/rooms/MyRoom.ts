import { Room, type Client } from "@colyseus/core";

import {
  MyRoomState,
  PlayerState,
} from "./schema/MyRoomState.js";

export class MyRoom extends Room {
  maxClients = 2;

  state = new MyRoomState();

  onCreate() {
    console.log("[MyRoom] created");
  }

  onJoin(client: Client) {
    const player = new PlayerState();

    player.id = client.sessionId;
    player.connected = true;

    this.state.players.set(client.sessionId, player);

    console.log(`[MyRoom] joined: ${client.sessionId}`);
    console.log(`[MyRoom] players: ${this.state.players.size}`);
  }

  onLeave(client: Client) {
    this.state.players.delete(client.sessionId);

    console.log(`[MyRoom] left: ${client.sessionId}`);
    console.log(`[MyRoom] players: ${this.state.players.size}`);
  }
}