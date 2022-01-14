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

export interface GameModeModel {
  hash: string;
  name: string;
}

export interface GameBaseModel {
  id: number;
  name: string;
  slug: string;
  hash: string;
  cover: number | null;
}

export interface GameInfoBaseModel {
  totalRating: number;
  totalRatingCount: number;
  igdbTotalRating: number;
  igdbTotalRatingCount: number;
  storyline: string;
  summary: string;
  screenshots: number[];
  artworks: number[];
  releaseDate: number;
}

export interface GameInfoCachedModel extends GameInfoBaseModel {
  websiteIds: number[];
  genreIds: number[];
  companyIds: number[];
  themeIds: number[];
  modeIds: number[];
}

export interface GameInfoModel extends GameInfoBaseModel {
  websites: WebsiteModel[];
  genres: GenreModel[];
  companies: CompanyModel[];
  themes: ThemeModel[];
  modes: GameModeModel[];
}

export interface UserGameModel {
  gameSlug: string;
  relatedExecution?: string;
}

export interface UserGameModelFull extends UserGameModel, GameBaseModel {}
