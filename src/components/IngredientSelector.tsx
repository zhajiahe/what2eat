"use client";

import { useState, useMemo } from "react";
import { useAppStore } from "@/lib/store";

interface Props {
  selected: Set<string>;
  onToggle: (name: string) => void;
}

export default function IngredientSelector({ selected, onToggle }: Props) {
  const [search, setSearch] = useState("");
  const ingredients = useAppStore((s) => s.ingredients);

  const filtered = ingredients.filter((i) => i.name.includes(search));

  const grouped = useMemo(() => {
    const map: Record<string, typeof filtered> = {};
    for (const item of filtered) {
      const cat = item.remark || "其他";
      (map[cat] ??= []).push(item);
    }
    return map;
  }, [filtered]);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold">选择食材</h2>
        <span className="text-xs text-muted">已选 {selected.size} 项</span>
      </div>
      <input
        type="text"
        placeholder="搜索食材..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full rounded-lg border border-border px-3 py-1.5 text-sm outline-none focus:border-primary"
      />
      <div className="max-h-60 space-y-2 overflow-y-auto">
        {Object.entries(grouped).map(([category, items]) => (
          <div key={category}>
            <span className="text-xs font-semibold text-muted">{category}</span>
            <div className="mt-1 flex flex-wrap gap-2">
              {items.map((item) => {
                const active = selected.has(item.name);
                return (
                  <button
                    key={item.id}
                    onClick={() => onToggle(item.name)}
                    className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                      active
                        ? "bg-primary text-white"
                        : "border border-border text-foreground hover:border-primary"
                    }`}
                  >
                    {item.name}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
        {Object.keys(grouped).length === 0 && (
          <p className="py-4 text-center text-xs text-muted">
            没有食材，请先在「食材」页面添加
          </p>
        )}
      </div>
    </div>
  );
}
