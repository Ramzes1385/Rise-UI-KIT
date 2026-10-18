const FNV_OFFSET = 0x811c9dc5
const FNV_PRIME = 0x01000193

/** FNV-1a, 32 бита: одна и та же строка всегда даёт одно и то же зерно */
export function hashString(text: string): number {
	let hash = FNV_OFFSET
	for (let index = 0; index < text.length; index += 1) {
		hash ^= text.charCodeAt(index)
		hash = Math.imul(hash, FNV_PRIME)
	}
	return hash >>> 0
}

/** mulberry32: числа [0, 1) по зерну */
export function mulberry32(seed: number): () => number {
	let state = seed >>> 0
	return () => {
		state = (state + 0x6d2b79f5) >>> 0
		let mixed = Math.imul(state ^ (state >>> 15), state | 1)
		mixed ^= mixed + Math.imul(mixed ^ (mixed >>> 7), mixed | 61)
		return ((mixed ^ (mixed >>> 14)) >>> 0) / 4294967296
	}
}

/** Детерминированный источник случайных чисел: строка-зерно хешируется, число берётся как есть */
export function createSeededRandom(seed: string | number) {
	const next = mulberry32(typeof seed === 'string' ? hashString(seed) : seed)
	return {
		next,
		range: (min: number, max: number): number => min + next() * (max - min),
		int: (min: number, max: number): number => min + Math.floor(next() * (max - min + 1)),
		chance: (probability: number): boolean => next() < probability,
		pick: <T>(items: readonly T[]): T => items[Math.floor(next() * items.length)],
	}
}
