export interface GameModelData {
  name: string;
  iconPath: string;
  posterImagePath: string;
  wallpaperPath: string;
  platform: string;
  executionCommand: string;
}

export interface GameModel {
  data: GameModelData;
}
