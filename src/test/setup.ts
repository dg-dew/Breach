import '@testing-library/jest-dom/vitest'

// jsdom lacks matchMedia — polyfill it
if (typeof window !== 'undefined' && !window.matchMedia) {
  window.matchMedia = (query: string) =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }) as unknown as MediaQueryList
}

// jsdom lacks ResizeObserver — stub it
if (typeof window !== 'undefined' && !(window as unknown as { ResizeObserver?: unknown }).ResizeObserver) {
  class ResizeObserverStub {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  ;(window as unknown as { ResizeObserver: unknown }).ResizeObserver = ResizeObserverStub
}

// jsdom lacks IntersectionObserver — stub it (framer-motion whileInView)
if (typeof window !== 'undefined' && !window.IntersectionObserver) {
  class IntersectionObserverStub {
    root: Element | null = null
    rootMargin = ''
    thresholds: number[] = []
    private cb: IntersectionObserverCallback
    private els = new Set<Element>()
    constructor(cb: IntersectionObserverCallback) {
      this.cb = cb
    }
    observe(el: Element) {
      this.els.add(el)
      this.cb([{ target: el, isIntersecting: true } as IntersectionObserverEntry], this as unknown as IntersectionObserver)
    }
    unobserve(el: Element) {
      this.els.delete(el)
    }
    disconnect() {
      this.els.clear()
    }
    takeRecords() {
      return []
    }
  }
  ;(window as unknown as { IntersectionObserver: unknown }).IntersectionObserver = IntersectionObserverStub
}

// jsdom lacks proper canvas getContext — the R3F guard relies on this returning null
if (typeof window !== 'undefined') {
  const origGetContext = HTMLCanvasElement.prototype.getContext
  HTMLCanvasElement.prototype.getContext = function (
    this: HTMLCanvasElement,
    contextId: string,
  ) {
    if (contextId === 'webgl' || contextId === 'webgl2' || contextId === '2d') {
      return null
    }
    return origGetContext.call(this, contextId as '2d')
  } as typeof origGetContext
}