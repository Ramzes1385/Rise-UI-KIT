import { createSeededRandom, hashString, mulberry32 } from '../../geometry/seededRandom'

describe('hashString', () => {
	it('FNV-1a: известные значения и стабильность', () => {
		expect(hashString('')).toBe(0x811c9dc5)
		expect(hashString('a')).toBe(0xe40c292c)
		expect(hashString('foobar')).toBe(0xbf9cf968)
		expect(hashString('поток')).toBe(hashString('поток'))
		expect(hashString('a')).not.toBe(hashString('b'))
	})
})

describe('mulberry32', () => {
	it('одно зерно — одна последовательность, числа в [0, 1)', () => {
		const first = mulberry32(42)
		const second = mulberry32(42)
		const values = Array.from({ length: 200 }, () => first())
		expect(values).toEqual(Array.from({ length: 200 }, () => second()))
		expect(values.every(value => value >= 0 && value < 1)).toBe(true)
		expect(new Set(values).size).toBe(200)
	})

	it('разные зёрна дают разные последовательности', () => {
		expect(mulberry32(1)()).not.toBe(mulberry32(2)())
	})
})

describe('createSeededRandom', () => {
	it('строка и число: строка хешируется, число берётся как есть', () => {
		expect(createSeededRandom('seed').next()).toBe(mulberry32(hashString('seed'))())
		expect(createSeededRandom(7).next()).toBe(mulberry32(7)())
	})

	it('range, int, chance, pick', () => {
		const random = createSeededRandom('r')
		const ranges = Array.from({ length: 100 }, () => random.range(5, 6))
		expect(ranges.every(value => value >= 5 && value < 6)).toBe(true)
		const ints = Array.from({ length: 300 }, () => random.int(1, 3))
		expect(new Set(ints)).toEqual(new Set([1, 2, 3]))
		const stub = createSeededRandom(1)
		const chances = Array.from({ length: 400 }, () => stub.chance(0.5))
		expect(chances).toContain(true)
		expect(chances).toContain(false)
		expect(createSeededRandom('x').chance(0)).toBe(false)
		expect(createSeededRandom('x').chance(1)).toBe(true)
		const items = ['a', 'b', 'c'] as const
		expect(Array.from({ length: 100 }, () => random.pick(items)).every(item => items.includes(item))).toBe(true)
	})

	it('два источника с одним зерном идут в ногу', () => {
		const [a, b] = [createSeededRandom('same'), createSeededRandom('same')]
		expect([a.int(0, 9), a.range(0, 1), a.pick([1, 2, 3])]).toEqual([b.int(0, 9), b.range(0, 1), b.pick([1, 2, 3])])
	})
})
