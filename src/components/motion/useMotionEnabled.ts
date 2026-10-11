"use client";
import { useSyncExternalStore } from "react";
const query = "(prefers-reduced-motion: no-preference) and (pointer: fine)";
type Connection = EventTarget & { saveData?: boolean };
function connection() {
  return (navigator as Navigator & { connection?: Connection }).connection;
}
function snapshot() {
  return (
    window.matchMedia(query).matches &&
    !connection()?.saveData &&
    (!navigator.hardwareConcurrency || navigator.hardwareConcurrency > 2)
  );
}
function subscribe(callback: () => void) {
  const mq = window.matchMedia(query),
    c = connection();
  mq.addEventListener("change", callback);
  c?.addEventListener("change", callback);
  return () => {
    mq.removeEventListener("change", callback);
    c?.removeEventListener("change", callback);
  };
}
export function useMotionEnabled() {
  return useSyncExternalStore(subscribe, snapshot, () => false);
}
