export interface GenreModel {
  hash: string;
  name: string;
}

export interface WebsiteModel {
  hash: string;
  trusted: boolean;
  category: number;
  url: string;
}

export interface ThemeModel {
  hash: string;
  name: string;
}

export interface CompanyModel {
  hash: string;
  name: string;
  developer: boolean;
  publisher: boolean;
}

export interface MediaModel {
  hash: string;
  width: number;
  height: number;
  data: string;
}

export interface GameBaseCachedModel {
  id: number;
  name: string;
  slug: string;
  hash: string;
}

export interface GameModeModel {
  hash: string;
  name: string;
}

export interface GameBaseModel extends GameBaseCachedModel {
  cover: MediaModel | null;
}

export interface GameInfoBaseModel {
  totalRating: number;
  totalRatingCount: number;
  igdbTotalRating: number;
  igdbTotalRatingCount: number;
  storyline: string;
  summary: string;
  releaseDate: number;
}

export interface GameInfoCachedModel extends GameInfoBaseModel {
  websiteIds: number[];
  genreIds: number[];
  screenshotIds: number[];
  artworkIds: number[];
  companyIds: number[];
  themeIds: number[];
  modeIds: number[];
}

export interface GameInfoModel extends GameInfoBaseModel {
  websites: WebsiteModel[];
  genres: GenreModel[];
  screenshots: MediaModel[];
  artworks: MediaModel[];
  companies: CompanyModel[];
  themes: ThemeModel[];
  modes: GameModeModel[];
}

export interface UserGameModel {
  gameSlug: string;
  relatedExecution?: string;
}

export interface UserGameModelFull extends UserGameModel, GameBaseModel {}
