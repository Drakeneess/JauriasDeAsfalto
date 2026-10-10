import { Client } from "@colyseus/sdk";

const endpoint =
  import.meta.env.VITE_COLYSEUS_URL ??
  "http://localhost:2567";

export const colyseus = new Client(endpoint);