import { type RefObject, useEffect } from "react";

import type { WaveSelection } from "../../../stores/wave-store.ts";
import { handleSelectionWheel, type SetWaveSelection } from "../selection-controls.ts";

export function useSelectionWheel(
  elementRef: RefObject<HTMLElement | null>,
  selection: WaveSelection,
  setSelection: SetWaveSelection,
  enabled = true,
): void {
  useEffect(() => {
    const element = elementRef.current;
    if (!element || !enabled) {
      return;
    }

    const onWheel = (event: WheelEvent) => {
      handleSelectionWheel(event, selection, setSelection);
    };

    element.addEventListener("wheel", onWheel, { passive: false });
    return () => element.removeEventListener("wheel", onWheel);
  }, [elementRef, enabled, selection, setSelection]);
}
