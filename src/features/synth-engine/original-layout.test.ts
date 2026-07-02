import { describe, expect, it } from "vitest";

import { playerModuleAreas } from "./original-layout.ts";

describe("playerModuleAreas", () => {
  it("6 行を返す", () => {
    expect(playerModuleAreas("a", "red")).toHaveLength(6);
    expect(playerModuleAreas("b", "yellow")).toHaveLength(6);
  });

  it("各行が 12 列", () => {
    for (const row of playerModuleAreas("a", "red")) {
      expect(row.split(" ")).toHaveLength(12);
    }
  });

  it("ディスプレイが上 3 行、操作帯が下 2 行", () => {
    const rows = playerModuleAreas("a", "red");
    expect(rows[0]).toContain("display-red");
    expect(rows[4]).toContain("keyboards-a");
    expect(rows[5]).toContain("keyboards-a");
  });
});
