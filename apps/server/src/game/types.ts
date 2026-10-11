import {
  MyRoomState,
} from "../rooms/schema/MyRoomState.js";

export type GameRoomState =
  InstanceType<
    typeof MyRoomState
  >;