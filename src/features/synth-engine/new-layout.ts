export type NewLayoutZone = "a" | "b";

export const PLAYER_A_COLOR = "#f3063e";
export const PLAYER_B_COLOR = "#ffcc00";

/**
 * プレイヤーモジュール 6 行 × 12 列の grid-template-areas。
 * layout-specs/new/layout.css を 180 度投影した Web 向け配置。
 * zone は接尾辞のみ。構造は A/B 共通（B は PlayerControlSurface で rotate(180deg)）。
 */
export function playerModuleAreas(zone: NewLayoutZone, display: "red" | "yellow"): string[] {
  const d = `display-${display}`;
  const r = (blk: string) => `${blk}-${zone}`;
  const kb = r("keyboards");
  const wj = r("wavejet");
  const knob = r("vertical-mobile-knob");

  return [
    `${r("mic")} ${d} ${d} ${d} ${d} ${d} ${d} ${d} ${d} ${d} ${d} ${d}`,
    `${r("record-button")} ${d} ${d} ${d} ${d} ${d} ${d} ${d} ${d} ${d} ${d} ${d}`,
    `${r("loop-button")} ${d} ${d} ${d} ${d} ${d} ${d} ${d} ${d} ${d} ${d} ${d}`,
    `${knob} ${wj} ${wj} ${wj} ${wj} ${wj} ${wj} ${wj} ${wj} ${wj} ${wj} ${wj}`,
    `${knob} ${r("plus-button")} ${kb} ${kb} ${kb} ${kb} ${kb} ${kb} ${kb} ${kb} ${kb} ${kb}`,
    `${knob} ${r("minus-button")} ${kb} ${kb} ${kb} ${kb} ${kb} ${kb} ${kb} ${kb} ${kb} ${kb}`,
  ];
}

export function playerModuleTemplate(zone: NewLayoutZone, display: "red" | "yellow"): string {
  return playerModuleAreas(zone, display)
    .map((row) => `"${row}"`)
    .join(" ");
}

/** グリッドの縦の配分（display 3 行 + wavejet + 鍵盤 2 行） */
export const NEW_PLAYER_MODULE_GRID_ROWS =
  "minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1fr) auto auto auto";

/** グリッドの横の配分（端コントロール + オクターブ + 鍵盤 10 列） */
export const NEW_PLAYER_MODULE_GRID_COLUMNS = "auto auto repeat(10, 1fr)";
