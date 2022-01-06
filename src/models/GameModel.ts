export interface GenreModel {
  hash: string;
  name: string;
}

export interface WebsiteModel {
  hash: string;
  trusted: boolean;
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

export interface GameBaseModel extends GameBaseCachedModel {
  cover: MediaModel | null;
}

export interface GameInfoBaseModel {
  totalRating: number;
  totalRatingCount: number;
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
}

export interface GameInfoModel extends GameInfoBaseModel {
  websites: WebsiteModel[];
  genres: GenreModel[];
  screenshots: MediaModel[];
  artworks: MediaModel[];
  companies: CompanyModel[];
  themes: ThemeModel[];
}

export interface UserGameModel {
  gameSlug: string;
  relatedExecution?: string;
}
