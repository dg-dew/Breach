# BREACH — The Algorithmic Infiltration

**A network-infiltration strategy game powered by Data Structures & Algorithms.**

BREACH is not a typical DSA visualizer. It is a cyber-operations interface where every algorithm is the literal engine of gameplay. You infiltrate fictional weighted networks, choose your algorithm, watch it execute step-by-step inside an operations console, and get scored on how optimally you breached the target.

The experience is built around a dark, atmospheric "underground hacker café" aesthetic — deep forest greens, warm amber tungsten light, aged brass, and blackened wood. No blue cyberpunk, no purple neon.

---

## Features

- **6 scripted missions** — BFS, DFS, Dijkstra, Prim, Kruskal, and Priority-Queue breaches, each with narrative, difficulty, time limits and scoring.
- **Procedural operations** — seeded, always-solvable generated networks with decoys, bottlenecks and locked routes.
- **Algorithm replay engine** — Play / Pause / Step / Restart / Speed on a frame-by-frame visualization of the actual algorithm execution, with live priority-queue snapshots and an execution log.
- **Interactive graph renderer** — SVG-based nodes as system endpoints, weighted edges with risk/block states, traversal highlighting (visited, queued, active, path).
- **Scoring system** — time, exposure, optimal route, unnecessary-node penalties, efficiency percentage.
- **Training doctrine** — interactive pages for every algorithm: live demo, pseudocode, complexity, analogies, practical applications.
- **Network Builder** — construct your own graph (nodes, links, weights, blocked edges, target), run any algorithm, export/import JSON.
- **Algorithm Battle** — run BFS, DFS and Dijkstra head-to-head on the same network and compare metrics.
- **Persistence** — progress, high scores, statistics and settings stored in `localStorage`.
- **Sound architecture** — synthesized Web Audio blips (no assets), mute toggle, no autoplay.
- **Accessibility** — keyboard navigation, visible focus states, semantic buttons, aria labels, `prefers-reduced-motion` support.
- **Performance** — route-level code splitting, lazy-loaded Three.js ambient layer, memoized SVG rendering.

## DSA Concepts

- Weighted undirected graphs (adjacency list)
- Breadth-First Search — fewest hops
- Depth-First Search — deep exploration
- Dijkstra's Algorithm with binary min-heap priority queue
- Minimum Spanning Trees — Prim's (greedy growth) and Kruskal's (union-find)
- Priority Queue / min-heap operations
- Path reconstruction from predecessor maps
- Complexity analysis (O(V+E), O((V+E) log V), O(E log E))

## Tech Stack

- **React 19 + Vite 8 + TypeScript (strict)**
- **Tailwind CSS** — custom dark-green / amber design system
- **Framer Motion** — microinteractions and cinematic transitions
- **React Three Fiber / Three.js** — one lazy-loaded ambient particle layer
- **Zustand** — global state with `persist` middleware
- **Lucide React** — icons
- **Vitest** — algorithm unit tests

## Architecture

```
src/
  algorithms/          # pure, framework-free algorithm implementations + steps
    bfs.ts dfs.ts dijkstra.ts prim.ts kruskal.ts index.ts pathReconstruction.ts
  data-structures/     # Graph, PriorityQueue (min-heap), Queue, Stack
  game/
    missions/          # static missions + procedural generator
    replay.ts          # algorithm steps -> visual frames
    scoring/           # score computation
    training/          # training doctrine content
  components/
    layout/ navigation/ graph/ algorithm/ mission/ dashboard/ training/ ambient/ ui/
  hooks/               # usePlayback, useSound, usePrefersReducedMotion
  pages/               # Landing, Operations, Mission, Training, Builder, Battle, Archive, Profile, Settings
  store/               # gameStore (persisted), settingsStore (persisted)
  types/               # shared TypeScript interfaces
  utils/               # sound engine, seeded RNG, formatting
```

The algorithm engine lives entirely outside React — each algorithm is a pure function that returns a result plus a stream of `AlgorithmStep` events. The `replay.ts` module compiles those steps into visual frames that the `GraphCanvas` renders, so the UI never touches graph logic and algorithms remain independently testable.

## Setup

```bash
# install dependencies
npm install

# start dev server (http://localhost:3000)
npm run dev
```

## Development

```bash
# run tests (Vitest)
npm run test
npm run test:watch

# typecheck
npx tsc --noEmit

# production build
npm run build

# preview the production build locally
npm run preview
```

## Deployment

The app is a fully static client-side SPA and deploys cleanly to **Vercel**.

```bash
# manual
npm run build
npx vercel --prod
```

The included `vercel.json` rewrites all routes to `index.html` (SPA fallback). The app uses hash-based routing, so it also works on any static host or file server with zero configuration.

### Environment configuration

There is no required runtime environment configuration. All game data is client-side. The only external resource is Google Fonts (Space Grotesk + JetBrains Mono) loaded via `<link>` in `index.html`; the app gracefully falls back to system fonts if offline.

## Screenshots

> Screenshots go here — hero, operations dashboard, mission replay, training doctrine, network builder, algorithm battle.

## License

Educational project — free to use and extend.