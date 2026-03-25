"use client";

import { useState } from "react";
import { useAppStore } from "@/lib/store";

export default function IngredientsPage() {
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState("");
  const [remark, setRemark] = useState("");

  const ingredients = useAppStore((s) => s.ingredients);
  const addIngredient = useAppStore((s) => s.addIngredient);
  const deleteIngredient = useAppStore((s) => s.deleteIngredient);

  const filtered = ingredients.filter(
    (i) => i.name.includes(search) || i.remark.includes(search)
  );

  async function handleAdd() {
    const trimmed = name.trim();
    if (!trimmed) return;
    await addIngredient(trimmed, remark.trim());
    setName("");
    setRemark("");
    setShowAdd(false);
  }

  return (
    <div className="space-y-4 pb-4">
      <h1 className="text-xl font-bold">食材库</h1>

      <input
        type="text"
        placeholder="搜索食材..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary"
      />

      {showAdd ? (
        <div className="space-y-2 rounded-lg border border-border bg-card p-3">
          <input
            type="text"
            placeholder="食材名称"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary"
            autoFocus
          />
          <input
            type="text"
            placeholder="备注（可选）"
            value={remark}
            onChange={(e) => setRemark(e.target.value)}
            className="w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary"
          />
          <div className="flex gap-2">
            <button
              onClick={handleAdd}
              className="rounded-lg bg-primary px-4 py-2 text-sm text-white"
            >
              添加
            </button>
            <button
              onClick={() => { setShowAdd(false); setName(""); setRemark(""); }}
              className="rounded-lg border border-border px-4 py-2 text-sm"
            >
              取消
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowAdd(true)}
          className="w-full rounded-lg border-2 border-dashed border-border py-3 text-sm text-muted transition-colors hover:border-primary hover:text-primary"
        >
          + 添加食材
        </button>
      )}

      <div className="space-y-2">
        {filtered.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between rounded-lg border border-border bg-card px-4 py-3"
          >
            <div>
              <span className="font-medium">{item.name}</span>
              {item.remark && (
                <span className="ml-2 text-xs text-muted">{item.remark}</span>
              )}
            </div>
            <button
              onClick={() => deleteIngredient(item.id!)}
              className="text-sm text-muted hover:text-danger"
            >
              删除
            </button>
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="py-8 text-center text-sm text-muted">
            {search ? "没有找到匹配的食材" : "还没有添加任何食材"}
          </p>
        )}
      </div>
    </div>
  );
}
