"use client";

import { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import type { SavedRecipe } from "@/lib/types";
import EatenMarker from "@/components/EatenMarker";

export default function RecipesPage() {
  const [search, setSearch] = useState("");

  const recipes = useLiveQuery(() =>
    db.recipes.orderBy("createdAt").reverse().toArray()
  );

  const eatenRecords = useLiveQuery(() => db.eatenRecords.toArray());

  const filtered = recipes?.filter(
    (r) => r.name.includes(search) || r.ingredients.some((i) => i.includes(search))
  );

  function getLastEaten(name: string): string | null {
    if (!eatenRecords) return null;
    const records = eatenRecords
      .filter((r) => r.dishName === name)
      .sort((a, b) => b.recordedAt - a.recordedAt);
    if (records.length === 0) return null;
    const d = new Date(records[0].eatenDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    d.setHours(0, 0, 0, 0);
    const diff = Math.round((today.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
    if (diff === 0) return "今天吃过";
    if (diff === 1) return "昨天吃过";
    return `${diff}天前吃过`;
  }

  return (
    <div className="space-y-4 pb-4">
      <h1 className="text-xl font-bold">我的菜谱</h1>

      <input
        type="text"
        placeholder="搜索菜谱..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary"
      />

      <div className="space-y-3">
        {filtered?.map((recipe) => (
          <RecipeItem
            key={recipe.id}
            recipe={recipe}
            lastEaten={getLastEaten(recipe.name)}
          />
        ))}
        {filtered?.length === 0 && (
          <p className="py-8 text-center text-sm text-muted">
            {search ? "没有找到匹配的菜谱" : "还没有保存任何菜谱"}
          </p>
        )}
      </div>
    </div>
  );
}

function RecipeItem({
  recipe,
  lastEaten,
}: {
  recipe: SavedRecipe;
  lastEaten: string | null;
}) {
  const [expanded, setExpanded] = useState(false);
  const [showEaten, setShowEaten] = useState(false);
  const [editing, setEditing] = useState(false);
  const [remark, setRemark] = useState(recipe.remark);

  async function handleDelete() {
    await db.recipes.delete(recipe.id!);
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
  }

  async function saveRemark() {
    await db.recipes.update(recipe.id!, { remark });
    setEditing(false);
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
        <div className="ml-2 flex flex-col items-end gap-1">
          {lastEaten && (
            <span className="rounded-full bg-green-50 px-2 py-0.5 text-[10px] text-success">
              {lastEaten}
            </span>
          )}
          <span className="text-xs text-muted">
            {expanded ? "收起 ▲" : "展开 ▼"}
          </span>
        </div>
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

          {editing ? (
            <div className="space-y-2">
              <textarea
                value={remark}
                onChange={(e) => setRemark(e.target.value)}
                placeholder="添加个人备注..."
                className="w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary"
                rows={2}
              />
              <div className="flex gap-2">
                <button
                  onClick={saveRemark}
                  className="rounded-lg bg-primary px-3 py-1 text-xs text-white"
                >
                  保存
                </button>
                <button
                  onClick={() => { setEditing(false); setRemark(recipe.remark); }}
                  className="rounded-lg border border-border px-3 py-1 text-xs"
                >
                  取消
                </button>
              </div>
            </div>
          ) : (
            recipe.remark && (
              <p className="text-xs text-muted">备注：{recipe.remark}</p>
            )
          )}
        </div>
      )}

      <div className="mt-3 flex gap-2">
        <button
          onClick={() => setShowEaten(true)}
          className="rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-white"
        >
          标记已吃
        </button>
        <button
          onClick={() => setEditing(true)}
          className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium"
        >
          备注
        </button>
        <button
          onClick={handleDelete}
          className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-danger"
        >
          删除
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
