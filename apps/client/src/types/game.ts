export type PlayerView = {
  id: string;
  connected: boolean;
};

export type TileView = {
  id: string;
  x: number;
  y: number;
};

export type DogView = {
  id: string;
  ownerId: string;
  tileId: string;
};

export type ConnectionStatus =
  | "Desconectado"
  | "Conectando..."
  | "Conectado"
  | "Error de conexión";

export type BaseView = {
  id: string;
  ownerId: string;
  food: number;
};