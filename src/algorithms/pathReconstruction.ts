/** Reconstruct a path from a predecessor map. Returns node ids from start -> end. */
export function reconstructPath(
  predecessors: Record<string, string | null>,
  start: string,
  end: string,
): string[] {
  const path: string[] = []
  let current: string | null = end
  const guard = new Set<string>()
  while (current !== null && current !== undefined) {
    if (guard.has(current)) break
    guard.add(current)
    path.unshift(current)
    if (current === start) break
    current = predecessors[current] ?? null
  }
  // Path is only valid if it actually reaches the start.
  if (path[0] !== start) return []
  return path
}
