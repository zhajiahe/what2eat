export interface Ingredient {
  id?: number;
  name: string;
  remark: string;
  createdAt: number;
}

export interface SavedRecipe {
  id?: number;
  name: string;
  ingredients: string[];
  steps: string[];
  estimatedTime: string;
  mainFood: string;
  nutrition: string;
  remark: string;
  createdAt: number;
}

export interface EatenRecord {
  id?: number;
  dishName: string;
  eatenDate: string;
  recordedAt: number;
}

export interface Filter {
  id?: number;
  category: string;
  name: string;
  createdAt: number;
}

export interface AppSettings {
  id?: number;
  apiUrl: string;
  apiKey: string;
  apiModel: string;
  tasteTags: string[];
}

export interface GeneratedRecipe {
  name: string;
  ingredients: string[];
  steps: string[];
  estimatedTime: string;
  mainFood: string;
  nutrition: string;
}

export interface GenerateRequest {
  selectedIngredients: string[];
  activeFilters: string[];
  recentlyEaten: { dishName: string; daysAgo: number }[];
  allIngredients: string[];
  isRandom: boolean;
  tasteTags: string[];
}
