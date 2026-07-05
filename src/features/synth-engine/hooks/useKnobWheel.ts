import { type RefObject, useEffect, useRef } from "react";

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
  const durationValueRef = useRef(durationValue);
  durationValueRef.current = durationValue;
  const onDurationChangeRef = useRef(onDurationChange);
  onDurationChangeRef.current = onDurationChange;

  useEffect(() => {
    const element = elementRef.current;
    if (!element || !enabled) {
      return;
    }

    const onWheel = (event: WheelEvent) => {
      handleKnobWheel(
        event,
        durationValueRef.current,
        onDurationChangeRef.current,
        durationMin,
        durationMax,
        durationStep,
      );
    };

    element.addEventListener("wheel", onWheel, { passive: false });
    return () => element.removeEventListener("wheel", onWheel);
  }, [durationMax, durationMin, durationStep, elementRef, enabled]);
}
