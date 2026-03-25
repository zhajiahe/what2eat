"use client";

import { useEffect } from "react";
import { useAppStore } from "@/lib/store";

export default function AppInit() {
  const init = useAppStore((s) => s.init);
  const initialized = useAppStore((s) => s.initialized);

  useEffect(() => {
    if (!initialized) init();
  }, [init, initialized]);

  return null;
}
