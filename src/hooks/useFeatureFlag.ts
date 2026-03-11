"use client";

import { useState, useEffect } from "react";

export function useFeatureFlag(flag: string): boolean {
  const [value, setValue] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const features = params.get("features") || "";
    setValue(features.split(",").includes(flag));
  }, [flag]);

  return value;
}
