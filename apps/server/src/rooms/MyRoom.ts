import { Room, type Client } from "@colyseus/core";

import { MyRoomState } from "./schema/MyRoomState.js";

export class MyRoom extends Room {
  maxClients = 2;

  state = new MyRoomState();

  onCreate() {
    console.log("[MyRoom] created");
  }

  onJoin(client: Client) {
    console.log(`[MyRoom] joined: ${client.sessionId}`);
  }

  onLeave(client: Client) {
    console.log(`[MyRoom] left: ${client.sessionId}`);
  }
}
