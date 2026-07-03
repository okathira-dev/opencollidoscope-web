import { describe, expect, it } from "vitest";

import { playerModuleAreas } from "./new-layout.ts";

describe("new playerModuleAreas", () => {
  it("6 行を返す", () => {
    expect(playerModuleAreas("a", "red")).toHaveLength(6);
    expect(playerModuleAreas("b", "yellow")).toHaveLength(6);
  });

  it("各行が 12 列", () => {
    for (const row of playerModuleAreas("a", "red")) {
      expect(row.split(" ")).toHaveLength(12);
    }
  });

  it("A/B で同じ構造（接尾辞のみ異なる）", () => {
    const rowsA = playerModuleAreas("a", "red");
    const rowsB = playerModuleAreas("b", "yellow");

    const normalize = (rows: string[]) =>
      rows.map((row) =>
        row
          .replace(/display-(red|yellow)/g, "display")
          .replace(/-a\b/g, "-ZONE")
          .replace(/-b\b/g, "-ZONE"),
      );

    expect(normalize(rowsA)).toEqual(normalize(rowsB));
  });

  it("新版コントロールを含む", () => {
    const rowsA = playerModuleAreas("a", "red");
    expect(rowsA[2]).toContain("loop-button-a");
    expect(rowsA[3]).toContain("vertical-mobile-knob-a");
    expect(rowsA[4]).toContain("keyboards-a");

    const rowsB = playerModuleAreas("b", "yellow");
    expect(rowsB[2]).toContain("loop-button-b");
    expect(rowsB[3]).toContain("vertical-mobile-knob-b");
    expect(rowsB[4]).toContain("keyboards-b");
  });
});
