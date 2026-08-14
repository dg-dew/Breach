/**
 * Binary Min-Heap based priority queue.
 * Lower priority value = higher precedence.
 */
export class PriorityQueue<T = string> {
  private heap: Array<{ item: T; priority: number }> = []

  get size(): number {
    return this.heap.length
  }

  get isEmpty(): boolean {
    return this.heap.length === 0
  }

  /** Peek at the highest-priority item without removing it. */
  peek(): { item: T; priority: number } | undefined {
    return this.heap[0]
  }

  push(item: T, priority: number): void {
    this.heap.push({ item, priority })
    this.bubbleUp(this.heap.length - 1)
  }

  /** Insert or decrease-priority (update) of an existing item. */
  decreaseKey(item: T, priority: number): void {
    const index = this.heap.findIndex((entry) => entry.item === item)
    if (index === -1) {
      this.push(item, priority)
      return
    }
    if (priority < this.heap[index].priority) {
      this.heap[index].priority = priority
      this.bubbleUp(index)
    }
  }

  pop(): T | undefined {
    if (this.heap.length === 0) return undefined
    const top = this.heap[0]
    const last = this.heap.pop()!
    if (this.heap.length > 0) {
      this.heap[0] = last
      this.sinkDown(0)
    }
    return top.item
  }

  toArray(): Array<{ item: T; priority: number }> {
    // Return a snapshot copy sorted by priority for display.
    return [...this.heap].sort((a, b) => a.priority - b.priority).map((e) => ({ ...e }))
  }

  private bubbleUp(index: number): void {
    while (index > 0) {
      const parent = Math.floor((index - 1) / 2)
      if (this.heap[parent].priority <= this.heap[index].priority) break
      ;[this.heap[parent], this.heap[index]] = [this.heap[index], this.heap[parent]]
      index = parent
    }
  }

  private sinkDown(index: number): void {
    const length = this.heap.length
    while (true) {
      const left = 2 * index + 1
      const right = 2 * index + 2
      let smallest = index
      if (left < length && this.heap[left].priority < this.heap[smallest].priority) {
        smallest = left
      }
      if (right < length && this.heap[right].priority < this.heap[smallest].priority) {
        smallest = right
      }
      if (smallest === index) break
      ;[this.heap[smallest], this.heap[index]] = [this.heap[index], this.heap[smallest]]
      index = smallest
    }
  }
}
