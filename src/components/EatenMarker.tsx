"use client";

import { useState } from "react";

interface Props {
  dishName: string;
  onConfirm: (daysAgo: number) => void;
  onClose: () => void;
}

const OPTIONS = [
  { label: "今天", value: 0 },
  { label: "昨天", value: 1 },
  { label: "2天前", value: 2 },
  { label: "3天前", value: 3 },
];

export default function EatenMarker({ dishName, onConfirm, onClose }: Props) {
  const [selected, setSelected] = useState(0);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/30" onClick={onClose}>
      <div
        className="w-full max-w-lg rounded-t-2xl bg-white p-4 pb-8"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="mb-3 text-sm font-semibold">
          标记「{dishName}」已吃
        </h3>
        <div className="flex gap-2">
          {OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setSelected(opt.value)}
              className={`flex-1 rounded-lg py-2 text-sm font-medium ${
                selected === opt.value
                  ? "bg-primary text-white"
                  : "border border-border"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <div className="mt-4 flex gap-2">
          <button
            onClick={() => onConfirm(selected)}
            className="flex-1 rounded-lg bg-primary py-2 text-sm font-medium text-white"
          >
            确定
          </button>
          <button
            onClick={onClose}
            className="flex-1 rounded-lg border border-border py-2 text-sm font-medium"
          >
            取消
          </button>
        </div>
      </div>
    </div>
  );
}
