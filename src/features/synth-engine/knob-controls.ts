export function handleKnobWheel(
  event: { deltaY: number; preventDefault: () => void },
  durationValue: number,
  onDurationChange: (value: number) => void,
  durationMin: number,
  durationMax: number,
  durationStep: number,
): void {
  if (event.deltaY === 0) {
    return;
  }

  event.preventDefault();

  const delta = event.deltaY < 0 ? durationStep : -durationStep;
  const next = Math.min(Math.max(durationValue + delta, durationMin), durationMax);
  if (next !== durationValue) {
    onDurationChange(next);
  }
}
