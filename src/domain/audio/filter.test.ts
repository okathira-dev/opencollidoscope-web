import { describe, expect, it } from "vitest";

import { midiToFilterCutoff, selectionAlphaFromFilter } from "./filter.ts";

describe("midiToFilterCutoff", () => {
  it("returns minCutoff at midi 0", () => {
    expect(midiToFilterCutoff(0, 200, 22050)).toBeCloseTo(200);
  });

  it("returns maxCutoff at midi 127", () => {
    expect(midiToFilterCutoff(127, 200, 22050)).toBeCloseTo(22050);
  });

  it("uses minCutoff as exponent base (replaces hardcoded 200 in original)", () => {
    expect(midiToFilterCutoff(127, 500, 22050)).toBeCloseTo(22050);
    expect(midiToFilterCutoff(0, 500, 22050)).toBeCloseTo(500);
  });

  it("clamps out-of-range values", () => {
    expect(midiToFilterCutoff(-10, 200, 22050)).toBeCloseTo(200);
    expect(midiToFilterCutoff(200, 200, 22050)).toBeCloseTo(22050);
  });
});

describe("selectionAlphaFromFilter", () => {
  it("returns 0.5 at midi 0", () => {
    expect(selectionAlphaFromFilter(0)).toBeCloseTo(0.5);
  });

  it("returns 1.0 at midi 127", () => {
    expect(selectionAlphaFromFilter(127)).toBeCloseTo(1.0);
  });
});
