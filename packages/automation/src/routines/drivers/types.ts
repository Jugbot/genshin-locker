/**
 * High-level Inventory actions that differ between input methods.
 * Artifact indices are row-major positions in the artifact grid.
 */
export interface InputDriver {
  /** Open the Artifacts tab with the first artifact selected at the top of the grid. */
  setup(): Promise<void>
  /** Always called when the routine ends (e.g. unplug the virtual gamepad). */
  teardown(): void
  /**
   * Groups of indices, in visiting order, that can be revisited without
   * disturbing each other. The driver scrolls between groups. Infinite; the
   * routine stops once navigation fails.
   */
  batches(): AsyncGenerator<number[]>
  /** Try to select artifact `index`, from wherever the selection currently is. */
  select(index: number): Promise<void>
  /** Called after a failed navigation with the index that is actually still selected. */
  markSelected?(index: number): void
  /** Toggle the lock on the selected artifact. */
  toggleLock(): Promise<void>
}
