import { create } from "zustand";
import type { SectionId } from "@/src/lib/scrollState";

interface UIState {
  ready: boolean;
  entered: boolean;
  activeSection: SectionId;
  setReady: (v: boolean) => void;
  setEntered: (v: boolean) => void;
  setActiveSection: (s: SectionId) => void;
}

export const useUIStore = create<UIState>((set) => ({
  ready: false,
  entered: false,
  activeSection: "hero",
  setReady: (v) => set({ ready: v }),
  setEntered: (v) => set({ entered: v }),
  setActiveSection: (s) => set({ activeSection: s }),
}));
