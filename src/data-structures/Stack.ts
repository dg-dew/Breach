/** LIFO stack used by DFS. */
export class Stack<T = string> {
  private items: T[] = []

  get size(): number {
    return this.items.length
  }

  get isEmpty(): boolean {
    return this.items.length === 0
  }

  push(item: T): void {
    this.items.push(item)
  }

  pop(): T | undefined {
    return this.items.pop()
  }

  peek(): T | undefined {
    return this.items[this.items.length - 1]
  }

  toArray(): T[] {
    return [...this.items]
  }
}
