"use client";

import { useAppStore } from "@/lib/store";

interface Props {
  active: Set<string>;
  onToggle: (name: string) => void;
}

export default function FilterPanel({ active, onToggle }: Props) {
  const filters = useAppStore((s) => s.filters);

  const grouped = filters.reduce<Record<string, typeof filters>>((acc, f) => {
    (acc[f.category] ??= []).push(f);
    return acc;
  }, {});

  if (Object.keys(grouped).length === 0) return null;

  return (
    <div className="space-y-2">
      <h2 className="text-sm font-semibold">过滤器</h2>
      {Object.entries(grouped).map(([category, items]) => (
        <div key={category} className="space-y-1">
          <span className="text-xs text-muted">{category}</span>
          <div className="flex flex-wrap gap-2">
            {items.map((f) => {
              const isActive = active.has(f.name);
              return (
                <button
                  key={f.id}
                  onClick={() => onToggle(f.name)}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                    isActive
                      ? "bg-primary text-white"
                      : "border border-border text-foreground hover:border-primary"
                  }`}
                >
                  {f.name}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
