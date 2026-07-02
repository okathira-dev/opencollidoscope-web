import type { WaveSelection } from "../../stores/wave-store.ts";

export type SetWaveSelection = (start: number, size: number) => void;

export function handleSelectionWheel(
  event: { deltaX: number; deltaY: number; preventDefault: () => void },
  selection: WaveSelection,
  setSelection: SetWaveSelection,
): void {
  if (selection.isNull) {
    return;
  }

  const absX = Math.abs(event.deltaX);
  const absY = Math.abs(event.deltaY);

  if (absX === 0 && absY === 0) {
    return;
  }

  event.preventDefault();

  if (absX >= absY) {
    const delta = event.deltaX > 0 ? 1 : -1;
    setSelection(selection.start + delta, selection.size);
    return;
  }

  const delta = event.deltaY < 0 ? 1 : -1;
  setSelection(selection.start, selection.size + delta);
}
