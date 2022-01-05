export interface GenreModel {
  hash: string;
  name: string;
}

export interface WebsiteModel {
  hash: string;
  trusted: boolean;
  url: string;
}

export interface MediaModel {
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
  cover: MediaModel | null;
}

export interface GameInfoBaseModel {
  totalRating: number;
  totalRatingCount: number;
  storyline: string;
  summary: string;
}

export interface GameInfoCachedModel extends GameInfoBaseModel {
  websiteIds: number[];
  genreIds: number[];
  screenshotIds: number[];
  artworkIds: number[];
}

export interface GameInfoModel extends GameInfoBaseModel {
  websites: WebsiteModel[];
  genres: GenreModel[];
  screenshots: MediaModel[];
  artworks: MediaModel[];
}

export interface GameModel extends GameBaseModel, GameInfoModel {
  relatedExecution?: string;
}

export interface UserGameModel {
  gameSlug: string;
  relatedExecution?: string;
}
