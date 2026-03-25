"use client";

import { useState, useEffect } from "react";
import { useAppStore } from "@/lib/store";
import { useToast } from "@/components/Toast";

export default function SettingsPage() {
  const settings = useAppStore((s) => s.settings);
  const settingsLoaded = useAppStore((s) => s.settingsLoaded);
  const saveSettings = useAppStore((s) => s.saveSettings);
  const filters = useAppStore((s) => s.filters);
  const addFilter = useAppStore((s) => s.addFilter);
  const deleteFilter = useAppStore((s) => s.deleteFilter);
  const toast = useToast();

  const [apiUrl, setApiUrl] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [apiModel, setApiModel] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tasteTags, setTasteTags] = useState<string[]>([]);
  const [filterCategory, setFilterCategory] = useState("");
  const [filterName, setFilterName] = useState("");

  useEffect(() => {
    if (settingsLoaded) {
      setApiUrl(settings.apiUrl);
      setApiKey(settings.apiKey);
      setApiModel(settings.apiModel);
      setTasteTags(settings.tasteTags);
    }
  }, [settingsLoaded, settings]);

  async function handleSaveConnection() {
    await saveSettings({ apiUrl, apiKey, apiModel });
    toast("连接设置已保存", "success");
  }

  async function handleAddTag() {
    const t = tagInput.trim();
    if (!t || tasteTags.includes(t)) return;
    const next = [...tasteTags, t];
    setTasteTags(next);
    setTagInput("");
    await saveSettings({ tasteTags: next });
  }

  async function handleRemoveTag(tag: string) {
    const next = tasteTags.filter((t) => t !== tag);
    setTasteTags(next);
    await saveSettings({ tasteTags: next });
  }

  async function handleAddFilter() {
    const cat = filterCategory.trim();
    const name = filterName.trim();
    if (!cat || !name) return;
    await addFilter(cat, name);
    setFilterCategory("");
    setFilterName("");
  }

  const grouped = filters.reduce<Record<string, typeof filters>>((acc, f) => {
    (acc[f.category] ??= []).push(f);
    return acc;
  }, {});

  return (
    <div className="space-y-6 pb-4">
      <h1 className="text-xl font-bold">设置</h1>

      <section className="space-y-2">
        <h2 className="text-sm font-semibold text-muted">AI 接口配置</h2>
        <input
          type="text"
          placeholder="API URL"
          value={apiUrl}
          onChange={(e) => setApiUrl(e.target.value)}
          className="w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary"
        />
        <input
          type="password"
          placeholder="API Key"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          className="w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary"
        />
        <input
          type="text"
          placeholder="模型名称"
          value={apiModel}
          onChange={(e) => setApiModel(e.target.value)}
          className="w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary"
        />
        <button
          onClick={handleSaveConnection}
          className="rounded-lg bg-primary px-4 py-2 text-sm text-white"
        >
          保存
        </button>
      </section>

      <section className="space-y-2">
        <h2 className="text-sm font-semibold text-muted">全局口味偏好</h2>
        <div className="flex flex-wrap gap-2">
          {tasteTags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 rounded-full bg-primary-light px-3 py-1 text-xs font-medium text-primary"
            >
              {tag}
              <button onClick={() => handleRemoveTag(tag)} className="hover:text-danger">
                ×
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="添加口味标签"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddTag()}
            className="flex-1 rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary"
          />
          <button
            onClick={handleAddTag}
            className="rounded-lg bg-primary px-4 py-2 text-sm text-white"
          >
            添加
          </button>
        </div>
      </section>

      <section className="space-y-2">
        <h2 className="text-sm font-semibold text-muted">过滤器管理</h2>

        {Object.entries(grouped).map(([category, items]) => (
          <div key={category} className="space-y-1">
            <h3 className="text-xs font-semibold text-muted">{category}</h3>
            <div className="flex flex-wrap gap-2">
              {items.map((f) => (
                <span
                  key={f.id}
                  className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1 text-xs"
                >
                  {f.name}
                  <button
                    onClick={() => deleteFilter(f.id!)}
                    className="text-muted hover:text-danger"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        ))}

        <div className="flex gap-2">
          <input
            type="text"
            placeholder="分类"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="w-24 rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary"
          />
          <input
            type="text"
            placeholder="过滤器名称"
            value={filterName}
            onChange={(e) => setFilterName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddFilter()}
            className="flex-1 rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary"
          />
          <button
            onClick={handleAddFilter}
            className="rounded-lg bg-primary px-4 py-2 text-sm text-white"
          >
            添加
          </button>
        </div>
      </section>
    </div>
  );
}
