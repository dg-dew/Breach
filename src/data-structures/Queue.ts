/** FIFO queue used by BFS. */
export class Queue<T = string> {
  private items: T[] = []

  get size(): number {
    return this.items.length
  }

  get isEmpty(): boolean {
    return this.items.length === 0
  }

  enqueue(item: T): void {
    this.items.push(item)
  }

  dequeue(): T | undefined {
    return this.items.shift()
  }

  peek(): T | undefined {
    return this.items[0]
  }

  toArray(): T[] {
    return [...this.items]
  }
}
