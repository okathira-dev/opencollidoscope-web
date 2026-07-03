import { type RefObject, useEffect } from "react";

import { handleKnobWheel } from "../knob-controls.ts";

export function useKnobWheel(
  elementRef: RefObject<HTMLElement | null>,
  durationValue: number,
  onDurationChange: (value: number) => void,
  durationMin: number,
  durationMax: number,
  durationStep: number,
  enabled = true,
): void {
  useEffect(() => {
    const element = elementRef.current;
    if (!element || !enabled) {
      return;
    }

    const onWheel = (event: WheelEvent) => {
      handleKnobWheel(
        event,
        durationValue,
        onDurationChange,
        durationMin,
        durationMax,
        durationStep,
      );
    };

    element.addEventListener("wheel", onWheel, { passive: false });
    return () => element.removeEventListener("wheel", onWheel);
  }, [
    durationMax,
    durationMin,
    durationStep,
    durationValue,
    elementRef,
    enabled,
    onDurationChange,
  ]);
}
