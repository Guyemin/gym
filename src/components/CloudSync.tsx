"use client";

import { useEffect } from "react";
import { startSync } from "@/lib/sync";

export default function CloudSync() {
  useEffect(() => {
    startSync();
  }, []);
  return null;
}
