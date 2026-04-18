/**
 * interactionGrid.ts
 *
 * Provides a low-resolution attraction map (grid) which aggregates
 * interaction points into cells. This lets the particle engine query
 * a compact scalar field instead of iterating over all interactors.
 *
 * Notation:
 * - x,y coordinates passed to update()/getAttraction() are expected to be
 *   in PIXEL space (the canvas' coordinate system). The Mediapipe stores
 *   keep normalized coords; callers must convert before calling update().
 */

export type InteractionPoint = { x: number; y: number; score?: number };

export class InteractionGrid {
  cols: number;
  rows: number;
  width: number;
  height: number;
  cells: Float32Array;

  constructor(cols = 40, rows = 30) {
    /*
      constructor(cols, rows)
      - Initialize a low-resolution attraction grid with `cols x rows` cells.
      - The grid is resized later to match a canvas' pixel dimensions via
      `resize(width, height)`.
    */
    this.cols = cols; this.rows = rows;
    this.width = 0; this.height = 0;
    this.cells = new Float32Array(cols * rows);
  }

  /**
   * Resize the logical grid to correspond to a canvas size.
   */
  resize(width: number, height: number) {
    /*
      resize(width, height)
      - Set the grid's pixel dimensions and reset cell accumulators.
      - Must be called when the canvas size changes.
    */
    this.width = width; this.height = height;
    this.cells = new Float32Array(this.cols * this.rows);
  }

  clear() { this.cells.fill(0); }

  /**
   * Update the grid by rasterizing interaction points.
   * Points must be provided in pixel coordinates.
   */
  update(points: InteractionPoint[]) {
    /*
      update(points)
      - Rasterize interaction points (in PIXEL space) into the grid cells.
      - Each point contributes its `score` (or 1) to the corresponding cell.
    */
    this.clear();
    if (this.width === 0 || this.height === 0) return;
    for (const p of points) {
      const cx = Math.floor((p.x / this.width) * this.cols);
      const cy = Math.floor((p.y / this.height) * this.rows);
      if (cx < 0 || cy < 0 || cx >= this.cols || cy >= this.rows) continue;
      const idx = cy * this.cols + cx;
      this.cells[idx] += (p.score || 1);
    }
  }

  /**
   * Lookup attraction at pixel position (x,y). Returns a scalar >= 0.
   */
  getAttraction(x: number, y: number) {
    /*
      getAttraction(x, y)
      - Lookup the aggregated attraction scalar for pixel position (x,y).
      - Returns >= 0; zero when outside grid bounds or when empty.
    */
    if (this.width === 0) return 0;
    const cx = Math.floor((x / this.width) * this.cols);
    const cy = Math.floor((y / this.height) * this.rows);
    if (cx < 0 || cy < 0 || cx >= this.cols || cy >= this.rows) return 0;
    return this.cells[cy * this.cols + cx] || 0;
  }
}
