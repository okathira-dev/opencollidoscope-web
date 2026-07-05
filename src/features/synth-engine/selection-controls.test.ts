import { describe, expect, it, vi } from "vitest";

import type { WaveSelection } from "../../stores/wave-store.ts";
import { handleSelectionWheel } from "./selection-controls.ts";

const baseSelection: WaveSelection = { kind: "active", start: 10, size: 5 };

describe("handleSelectionWheel", () => {
  it("縦ホイールで選択サイズを変更する", () => {
    const setSelection = vi.fn();
    const preventDefault = vi.fn();

    handleSelectionWheel({ deltaX: 0, deltaY: -100, preventDefault }, baseSelection, setSelection);

    expect(preventDefault).toHaveBeenCalled();
    expect(setSelection).toHaveBeenCalledWith(10, 6);
  });

  it("横スクロールで選択開始位置を変更する", () => {
    const setSelection = vi.fn();
    const preventDefault = vi.fn();

    handleSelectionWheel({ deltaX: 50, deltaY: 0, preventDefault }, baseSelection, setSelection);

    expect(setSelection).toHaveBeenCalledWith(11, 5);
  });

  it("empty のときは何もしない", () => {
    const setSelection = vi.fn();
    const preventDefault = vi.fn();

    handleSelectionWheel(
      { deltaX: 0, deltaY: -100, preventDefault },
      { kind: "empty" },
      setSelection,
    );

    expect(setSelection).not.toHaveBeenCalled();
    expect(preventDefault).not.toHaveBeenCalled();
  });
});
