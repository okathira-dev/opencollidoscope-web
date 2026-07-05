/** MUI Slider の onChange が number | number[] を返すため、単一値に正規化する */
export function unwrapSliderValue(value: number | number[], fallback: number): number {
  return Array.isArray(value) ? (value[0] ?? fallback) : value;
}
