/** Keep DOM order stable while placing each card in the shortest column. */
export function masonryLayout(heights: number[], columns: number, width: number, gap: number) {
  const bottoms = Array<number>(columns).fill(0);
  const positions = heights.map((height) => {
    const column = bottoms.indexOf(Math.min(...bottoms));
    const position = { x: column * (width + gap), y: bottoms[column] };
    bottoms[column] += height + gap;
    return position;
  });
  return { positions, height: Math.max(0, ...bottoms) - (heights.length ? gap : 0) };
}
