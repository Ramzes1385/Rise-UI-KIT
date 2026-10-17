/** Детерминированный генератор псевдослучайных чисел для воспроизводимого фаззинга (mulberry32, без зависимостей) */

export interface Rng {
	next: () => number
	int: (max: number) => number
	range: (min: number, max: number) => number
	chance: (probability: number) => boolean
	pick: <T>(items: readonly T[]) => T
	times: <T>(count: number, make: (index: number) => T) => T[]
}

/** FNV-1a: хеш строки в 32-битное число — из имени цели и номера итерации получается независимое зерно */
function hash(text: string): number {
	let value = 0x811c9dc5
	for (let index = 0; index < text.length; index += 1) {
		value ^= text.charCodeAt(index)
		value = Math.imul(value, 0x01000193)
	}
	return value >>> 0
}

export function createRng(seed: number): Rng {
	let state = seed >>> 0
	const next = (): number => {
		state = (state + 0x6d2b79f5) >>> 0
		let value = state
		value = Math.imul(value ^ (value >>> 15), value | 1)
		value ^= value + Math.imul(value ^ (value >>> 7), value | 61)
		return ((value ^ (value >>> 14)) >>> 0) / 4294967296
	}
	const int = (max: number): number => Math.floor(next() * max)
	return {
		next,
		int,
		range: (min, max) => min + int(max - min + 1),
		chance: probability => next() < probability,
		pick: items => items[int(items.length)],
		times: (count, make) => Array.from({ length: count }, make),
	}
}

/** Зерно итерации: одна и та же тройка (зерно запуска, цель, номер) всегда даёт один и тот же вход */
export function seedFor(base: number, target: string, index: number): number {
	return hash(`${base}:${target}:${index}`)
}
