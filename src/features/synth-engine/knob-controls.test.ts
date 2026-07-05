import { describe, expect, it, vi } from "vitest";

import { handleKnobWheel } from "./knob-controls.ts";

describe("handleKnobWheel", () => {
  it("ホイール上で Duration を増やす", () => {
    const onDurationChange = vi.fn();
    const event = { deltaY: -100, preventDefault: vi.fn() };

    handleKnobWheel(event, 1.0, onDurationChange, 1, 8, 0.1);

    expect(event.preventDefault).toHaveBeenCalled();
    expect(onDurationChange).toHaveBeenCalledWith(1.1);
  });

  it("ホイール下で Duration を減らす", () => {
    const onDurationChange = vi.fn();
    const event = { deltaY: 100, preventDefault: vi.fn() };

    handleKnobWheel(event, 2.0, onDurationChange, 1, 8, 0.1);

    expect(onDurationChange).toHaveBeenCalledWith(1.9);
  });

  it("範囲外にはクランプする", () => {
    const onDurationChange = vi.fn();
    const event = { deltaY: 100, preventDefault: vi.fn() };

    handleKnobWheel(event, 1.0, onDurationChange, 1, 8, 0.1);

    expect(onDurationChange).not.toHaveBeenCalled();
  });
});
