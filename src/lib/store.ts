import { create } from "zustand";
import { db, getSettings, updateSettings, initDefaultFilters, initDefaultIngredients, getRecentlyEaten } from "./db";
import type { AppSettings, GeneratedRecipe, Ingredient, Filter } from "./types";

interface AppState {
  // Settings
  settings: AppSettings;
  settingsLoaded: boolean;
  loadSettings: () => Promise<void>;
  saveSettings: (patch: Partial<Omit<AppSettings, "id">>) => Promise<void>;

  // Ingredients
  ingredients: Ingredient[];
  loadIngredients: () => Promise<void>;
  addIngredient: (name: string, remark: string) => Promise<void>;
  deleteIngredient: (id: number) => Promise<void>;

  // Filters
  filters: Filter[];
  loadFilters: () => Promise<void>;
  addFilter: (category: string, name: string) => Promise<void>;
  deleteFilter: (id: number) => Promise<void>;

  // Home page state
  selectedIngredients: Set<string>;
  toggleIngredient: (name: string) => void;
  clearSelection: () => void;

  activeFilters: Set<string>;
  toggleFilter: (name: string) => void;

  // Generated recipes
  recipes: GeneratedRecipe[];
  setRecipes: (recipes: GeneratedRecipe[]) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
  error: string;
  setError: (error: string) => void;
  rawText: string;
  setRawText: (text: string) => void;

  // Init
  initialized: boolean;
  init: () => Promise<void>;
}

export const useAppStore = create<AppState>((set, get) => ({
  // Settings
  settings: {
    apiUrl: "",
    apiKey: "",
    apiModel: "default",
    tasteTags: [],
  },
  settingsLoaded: false,

  loadSettings: async () => {
    const settings = await getSettings();
    set({ settings, settingsLoaded: true });
  },

  saveSettings: async (patch) => {
    await updateSettings(patch);
    const settings = await getSettings();
    set({ settings });
  },

  // Ingredients
  ingredients: [],

  loadIngredients: async () => {
    const ingredients = await db.ingredients.orderBy("createdAt").toArray();
    set({ ingredients });
  },

  addIngredient: async (name: string, remark: string) => {
    await db.ingredients.add({ name, remark, createdAt: Date.now() });
    await get().loadIngredients();
  },

  deleteIngredient: async (id: number) => {
    await db.ingredients.delete(id);
    await get().loadIngredients();
  },

  // Filters
  filters: [],

  loadFilters: async () => {
    const filters = await db.filters.toArray();
    set({ filters });
  },

  addFilter: async (category: string, name: string) => {
    await db.filters.add({ category, name, createdAt: Date.now() });
    await get().loadFilters();
  },

  deleteFilter: async (id: number) => {
    await db.filters.delete(id);
    await get().loadFilters();
  },

  // Home page state
  selectedIngredients: new Set<string>(),
  toggleIngredient: (name: string) => {
    set((state) => {
      const next = new Set(state.selectedIngredients);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return { selectedIngredients: next };
    });
  },
  clearSelection: () => set({ selectedIngredients: new Set() }),

  activeFilters: new Set<string>(),
  toggleFilter: (name: string) => {
    set((state) => {
      const next = new Set(state.activeFilters);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return { activeFilters: next };
    });
  },

  // Generated recipes
  recipes: [],
  setRecipes: (recipes) => set({ recipes }),
  loading: false,
  setLoading: (loading) => set({ loading }),
  error: "",
  setError: (error) => set({ error }),
  rawText: "",
  setRawText: (rawText) => set({ rawText }),

  // Init
  initialized: false,
  init: async () => {
    if (get().initialized) return;
    await initDefaultFilters();
    await initDefaultIngredients();
    await get().loadSettings();
    await get().loadIngredients();
    await get().loadFilters();
    set({ initialized: true });
  },
}));

export { getRecentlyEaten };
