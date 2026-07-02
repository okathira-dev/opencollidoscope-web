export type OriginalLayoutZone = "a" | "b";

export const PLAYER_A_COLOR = "#f3063e";
export const PLAYER_B_COLOR = "#ffcc00";

/**
 * プレイヤーモジュール 6 行 × 12 列の grid-template-areas。
 * "normal" = ディスプレイが上、操作帯が下（画面下方に座るプレイヤーの視点）。
 */
export function playerModuleAreas(zone: OriginalLayoutZone, display: "red" | "yellow"): string[] {
  const d = `display-${display}`;
  const r = (blk: string) => `${blk}-${zone}`;
  const kb = r("keyboards");
  const wj = r("wavejet");
  return [
    `. ${d} ${d} ${d} ${d} ${d} ${d} ${d} ${d} ${d} ${d} ${d}`,
    `${r("mic")} ${d} ${d} ${d} ${d} ${d} ${d} ${d} ${d} ${d} ${d} ${d}`,
    `${r("record-button")} ${d} ${d} ${d} ${d} ${d} ${d} ${d} ${d} ${d} ${d} ${d}`,
    `. ${wj} ${wj} ${wj} ${wj} ${wj} ${wj} ${wj} ${wj} ${wj} ${wj} ${wj}`,
    `${r("slider-moon-sun")} ${r("slider-moon-sun")} ${r("slider-moon-sun")} ${r("plus-button")} ${kb} ${kb} ${kb} ${kb} ${kb} ${kb} ${kb} ${r("toggle-switch")}`,
    `${r("slider-small-big")} ${r("slider-small-big")} ${r("slider-small-big")} ${r("minus-button")} ${kb} ${kb} ${kb} ${kb} ${kb} ${kb} ${kb} ${r("toggle-switch")}`,
  ];
}

export function playerModuleTemplate(zone: OriginalLayoutZone, display: "red" | "yellow"): string {
  return playerModuleAreas(zone, display)
    .map((row) => `"${row}"`)
    .join(" ");
}

/** グリッドの縦の配分 */
export const PLAYER_MODULE_GRID_ROWS = "1fr 1fr 1fr auto auto auto";

/** グリッドの横の配分 */
export const PLAYER_MODULE_GRID_COLUMNS = "auto 1fr 1fr auto repeat(7, 1fr) auto";
