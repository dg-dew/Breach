/**
 * Double-ended queue — supports push/pop from both ends in O(1).
 * Used by the campaign's task-manager missions (Act IV).
 */
export class Deque<T = string> {
  private items: T[] = []

  get size(): number {
    return this.items.length
  }

  get isEmpty(): boolean {
    return this.items.length === 0
  }

  pushBack(item: T): void {
    this.items.push(item)
  }

  pushFront(item: T): void {
    this.items.unshift(item)
  }

  popFront(): T | undefined {
    return this.items.shift()
  }

  popBack(): T | undefined {
    return this.items.pop()
  }

  peekFront(): T | undefined {
    return this.items[0]
  }

  peekBack(): T | undefined {
    return this.items[this.items.length - 1]
  }

  toArray(): T[] {
    return [...this.items]
  }
}
