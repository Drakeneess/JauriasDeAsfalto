import { defineRoom, defineServer } from "@colyseus/core";
import { WebSocketTransport } from "@colyseus/ws-transport";

import { MyRoom } from "./rooms/MyRoom.js";

const server = defineServer({
  transport: new WebSocketTransport(),

  rooms: {
    my_room: defineRoom(MyRoom),
  },
});

export default server;
