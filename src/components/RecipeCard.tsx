"use client";

import { useState } from "react";
import type { GeneratedRecipe } from "@/lib/types";
import { db } from "@/lib/db";
import EatenMarker from "./EatenMarker";
import { useToast } from "./Toast";

interface Props {
  recipe: GeneratedRecipe;
  saved?: boolean;
  savedId?: number;
  onSaved?: () => void;
}

export default function RecipeCard({ recipe, saved, savedId, onSaved }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [isSaved, setIsSaved] = useState(saved ?? false);
  const [showEaten, setShowEaten] = useState(false);
  const toast = useToast();

  async function handleSave() {
    if (isSaved) return;
    await db.recipes.add({
      name: recipe.name,
      ingredients: recipe.ingredients,
      steps: recipe.steps,
      estimatedTime: recipe.estimatedTime,
      mainFood: recipe.mainFood,
      nutrition: recipe.nutrition,
      remark: "",
      createdAt: Date.now(),
    });
    setIsSaved(true);
    onSaved?.();
    toast(`「${recipe.name}」已保存`, "success");
  }

  async function handleMarkEaten(daysAgo: number) {
    const d = new Date();
    d.setDate(d.getDate() - daysAgo);
    await db.eatenRecords.add({
      dishName: recipe.name,
      eatenDate: d.toISOString().split("T")[0],
      recordedAt: Date.now(),
    });
    setShowEaten(false);
    toast(`已标记「${recipe.name}」`, "success");
  }

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-start justify-between">
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex-1 text-left"
        >
          <h3 className="text-base font-bold">{recipe.name}</h3>
          <p className="mt-1 text-xs text-muted">
            {recipe.ingredients.join("、")} · {recipe.estimatedTime}
          </p>
        </button>
        <span className="ml-2 mt-1 text-xs text-muted">
          {expanded ? "收起 ▲" : "展开 ▼"}
        </span>
      </div>

      {expanded && (
        <div className="mt-3 space-y-2 text-sm">
          <div>
            <span className="font-semibold">步骤：</span>
            <ol className="ml-4 mt-1 list-decimal space-y-1 text-foreground/80">
              {recipe.steps.map((step, i) => (
                <li key={i}>{step}</li>
              ))}
            </ol>
          </div>
          <p>
            <span className="font-semibold">主食：</span>
            {recipe.mainFood}
          </p>
          <p>
            <span className="font-semibold">营养：</span>
            <span className="text-success">{recipe.nutrition}</span>
          </p>
        </div>
      )}

      <div className="mt-3 flex gap-2">
        <button
          onClick={handleSave}
          disabled={isSaved}
          className={`rounded-lg px-3 py-1.5 text-xs font-medium ${
            isSaved
              ? "bg-gray-100 text-muted"
              : "bg-primary text-white"
          }`}
        >
          {isSaved ? "已保存" : "保存"}
        </button>
        <button
          onClick={() => setShowEaten(true)}
          className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-foreground"
        >
          标记已吃
        </button>
      </div>

      {showEaten && (
        <EatenMarker
          dishName={recipe.name}
          onConfirm={handleMarkEaten}
          onClose={() => setShowEaten(false)}
        />
      )}
    </div>
  );
}
