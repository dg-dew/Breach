import { describe, it, expect } from 'vitest'
import { PriorityQueue } from '@/data-structures/PriorityQueue'
import { Queue } from '@/data-structures/Queue'
import { Stack } from '@/data-structures/Stack'

describe('PriorityQueue (min-heap)', () => {
  it('pops items in ascending priority order', () => {
    const pq = new PriorityQueue<string>()
    pq.push('c', 3)
    pq.push('a', 1)
    pq.push('b', 2)
    expect(pq.pop()).toBe('a')
    expect(pq.pop()).toBe('b')
    expect(pq.pop()).toBe('c')
    expect(pq.isEmpty).toBe(true)
  })

  it('handles decreaseKey', () => {
    const pq = new PriorityQueue<string>()
    pq.push('a', 5)
    pq.push('b', 2)
    pq.decreaseKey('a', 1)
    expect(pq.pop()).toBe('a')
    expect(pq.pop()).toBe('b')
  })

  it('returns empty from an empty queue', () => {
    const pq = new PriorityQueue<string>()
    expect(pq.pop()).toBeUndefined()
    expect(pq.size).toBe(0)
  })

  it('handles equal priorities', () => {
    const pq = new PriorityQueue<string>()
    pq.push('x', 2)
    pq.push('y', 2)
    pq.push('z', 2)
    const out: string[] = []
    while (!pq.isEmpty) out.push(pq.pop()!)
    expect(out.sort()).toEqual(['x', 'y', 'z'])
  })

  it('produces a sorted snapshot', () => {
    const pq = new PriorityQueue<string>()
    pq.push('a', 5)
    pq.push('b', 2)
    pq.push('c', 4)
    const snap = pq.toArray().map((e) => e.item)
    expect(snap).toEqual(['b', 'c', 'a'])
  })
})

describe('Queue', () => {
  it('is FIFO', () => {
    const q = new Queue<string>()
    q.enqueue('a')
    q.enqueue('b')
    expect(q.dequeue()).toBe('a')
    expect(q.dequeue()).toBe('b')
    expect(q.isEmpty).toBe(true)
  })
})

describe('Stack', () => {
  it('is LIFO', () => {
    const s = new Stack<string>()
    s.push('a')
    s.push('b')
    expect(s.pop()).toBe('b')
    expect(s.pop()).toBe('a')
  })
})