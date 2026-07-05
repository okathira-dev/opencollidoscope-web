import { type RefObject, useEffect } from "react";

import { getWaveStoreState } from "../../../stores/wave-store.ts";
import { handleSelectionWheel, type SetWaveSelection } from "../selection-controls.ts";

export function useSelectionWheel(
  elementRef: RefObject<HTMLElement | null>,
  setSelection: SetWaveSelection,
  enabled = true,
): void {
  useEffect(() => {
    const element = elementRef.current;
    if (!element || !enabled) {
      return;
    }

    const onWheel = (event: WheelEvent) => {
      handleSelectionWheel(event, getWaveStoreState().selection, setSelection);
    };

    element.addEventListener("wheel", onWheel, { passive: false });
    return () => element.removeEventListener("wheel", onWheel);
  }, [elementRef, enabled, setSelection]);
}
