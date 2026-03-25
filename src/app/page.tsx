"use client";

import { useRef } from "react";
import { useAppStore, getRecentlyEaten } from "@/lib/store";
import type { GenerateRequest, GeneratedRecipe } from "@/lib/types";
import IngredientSelector from "@/components/IngredientSelector";
import FilterPanel from "@/components/FilterPanel";
import RecipeCard from "@/components/RecipeCard";

export default function HomePage() {
  const selectedIngredients = useAppStore((s) => s.selectedIngredients);
  const toggleIngredient = useAppStore((s) => s.toggleIngredient);
  const activeFilters = useAppStore((s) => s.activeFilters);
  const toggleFilter = useAppStore((s) => s.toggleFilter);
  const recipes = useAppStore((s) => s.recipes);
  const setRecipes = useAppStore((s) => s.setRecipes);
  const loading = useAppStore((s) => s.loading);
  const setLoading = useAppStore((s) => s.setLoading);
  const error = useAppStore((s) => s.error);
  const setError = useAppStore((s) => s.setError);
  const rawText = useAppStore((s) => s.rawText);
  const setRawText = useAppStore((s) => s.setRawText);
  const settings = useAppStore((s) => s.settings);
  const ingredients = useAppStore((s) => s.ingredients);
  const abortRef = useRef<AbortController | null>(null);

  async function generate(isRandom: boolean) {
    if (loading) {
      abortRef.current?.abort();
      setLoading(false);
      return;
    }

    if (!isRandom && selectedIngredients.size === 0) {
      setError("请先勾选食材");
      return;
    }

    setLoading(true);
    setError("");
    setRecipes([]);
    setRawText("");

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const recentlyEaten = await getRecentlyEaten();
      const allIngredients = ingredients.map((i) => i.name);

      const body: GenerateRequest & { apiUrl: string; apiKey: string; apiModel: string } = {
        selectedIngredients: [...selectedIngredients],
        activeFilters: [...activeFilters],
        recentlyEaten,
        allIngredients,
        isRandom,
        tasteTags: settings.tasteTags,
        apiUrl: settings.apiUrl,
        apiKey: settings.apiKey,
        apiModel: settings.apiModel,
      };

      const resp = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      if (!resp.ok) {
        const data = await resp.json();
        throw new Error(data.error || `HTTP ${resp.status}`);
      }

      const reader = resp.body!.getReader();
      const decoder = new TextDecoder();
      let fullText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        fullText += decoder.decode(value, { stream: true });
        setRawText(fullText);
      }

      const parsed = parseRecipes(fullText);
      if (parsed.length === 0) {
        setError("AI 返回的格式无法解析，请重试");
      }
      setRecipes(parsed);
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") return;
      setError(err instanceof Error ? err.message : "生成失败");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4 pb-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">What2eat</h1>
      </div>

      <button
        onClick={() => generate(true)}
        className="w-full rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 py-3 text-sm font-bold text-white shadow-sm transition-transform active:scale-[0.98]"
      >
        {loading ? "生成中..." : "今日随机推荐 5 道菜"}
      </button>

      <IngredientSelector
        selected={selectedIngredients}
        onToggle={toggleIngredient}
      />

      <FilterPanel active={activeFilters} onToggle={toggleFilter} />

      <button
        onClick={() => generate(false)}
        className="w-full rounded-xl bg-primary py-3 text-sm font-bold text-white shadow-sm transition-transform active:scale-[0.98]"
      >
        {loading ? "停止生成" : "根据食材生成 5 道建议"}
      </button>

      {error && (
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-danger">
          {error}
        </div>
      )}

      {loading && rawText && (
        <div className="rounded-lg bg-card p-4">
          <p className="text-xs text-muted">AI 正在输出...</p>
          <pre className="mt-2 max-h-40 overflow-auto whitespace-pre-wrap text-xs text-foreground/70">
            {rawText}
          </pre>
        </div>
      )}

      {recipes.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-muted">
            生成了 {recipes.length} 道菜
          </h2>
          {recipes.map((recipe, i) => (
            <RecipeCard key={i} recipe={recipe} />
          ))}
        </div>
      )}
    </div>
  );
}

function parseRecipes(text: string): GeneratedRecipe[] {
  try {
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) return [];
    const arr = JSON.parse(jsonMatch[0]);
    if (!Array.isArray(arr)) return [];
    return arr
      .filter((item: Record<string, unknown>) => item.name)
      .map((item: Record<string, unknown>) => ({
        name: String(item.name || ""),
        ingredients: Array.isArray(item.ingredients)
          ? item.ingredients.map(String)
          : [],
        steps: Array.isArray(item.steps) ? item.steps.map(String) : [],
        estimatedTime: String(item.estimatedTime || ""),
        mainFood: String(item.mainFood || ""),
        nutrition: String(item.nutrition || ""),
      }));
  } catch {
    return [];
  }
}
