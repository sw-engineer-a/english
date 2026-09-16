export function mulberry32(seed: number): () => number {
  let a = seed | 0
  return () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function shuffle<T>(items: T[], rand: () => number): T[] {
  const copy = [...items]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

export function decodeIndex(n: number, sizes: number[]): number[] {
  const out: number[] = []
  let x = Math.abs(Math.floor(n))
  for (const size of sizes) {
    out.push(x % size)
    x = Math.floor(x / size)
  }
  return out
}

export function product(sizes: number[]): number {
  return sizes.reduce((acc, n) => acc * n, 1)
}

export function pick<T>(list: T[], index: number): T {
  return list[((index % list.length) + list.length) % list.length]
}
