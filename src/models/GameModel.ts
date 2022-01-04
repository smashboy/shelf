export interface GameCoverModel {
  hash: string;
  width: number;
  height: number;
  data: string;
}

export interface GameBaseModel {
  id: number;
  name: string;
  slug: string;
  hash: string;
  cover: GameCoverModel | null;
}

export interface GameInfoModel {
  totalRating: number;
  totalRatingCount: number;
  storyline: string;
  summary: string;
  websites: string[];
  genres: string[];
}

export interface GameModel extends GameBaseModel, GameInfoModel {
  relatedExecution?: string;
}
