"use client";

import { useEffect } from "react";

// Užregistruoja service worker'į (reikia programėlei ir pranešimams)
export default function SwRegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator) navigator.serviceWorker.register("/sw.js").catch(() => {});
  }, []);
  return null;
}
