import { setLocale } from '@/locales/state'
import { countProp, finiteProp, nonNegativeProp, orderedMax, positiveProp } from '../numberPropUtils'

const base = { component: 'BaseX', prop: 'size' }

describe('numberPropUtils', () => {
	let warnSpy: ReturnType<typeof vi.spyOn>

	beforeEach(() => {
		warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
	})

	afterEach(() => {
		warnSpy.mockRestore()
		setLocale('ru')
	})

	describe('finiteProp', () => {
		it('пропускает конечное число без предупреждения', () => {
			expect(finiteProp({ ...base, value: -3.5, fallback: 0 })).toBe(-3.5)
			expect(warnSpy).not.toHaveBeenCalled()
		})

		it.each([Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY])('%s заменяет на fallback с предупреждением', value => {
			expect(finiteProp({ ...base, value, fallback: 7 })).toBe(7)
			expect(warnSpy).toHaveBeenCalledWith(`[rise-ui-kit] BaseX: \`size\` = ${value} — не конечное число, используется 7`)
		})
	})

	describe('positiveProp', () => {
		it('пропускает число больше 0', () => {
			expect(positiveProp({ ...base, value: 0.1, fallback: 1 })).toBe(0.1)
			expect(warnSpy).not.toHaveBeenCalled()
		})

		it.each([0, -2])('%s заменяет на fallback: должно быть больше 0', value => {
			expect(positiveProp({ ...base, value, fallback: 1 })).toBe(1)
			expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('должно быть больше 0, используется 1'))
		})

		it('NaN заменяет на fallback: не конечное число', () => {
			expect(positiveProp({ ...base, value: Number.NaN, fallback: 1 })).toBe(1)
			expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('не конечное число'))
		})
	})

	describe('countProp', () => {
		it('пропускает целое число больше 0', () => {
			expect(countProp({ ...base, value: 10, fallback: 5 })).toBe(10)
			expect(warnSpy).not.toHaveBeenCalled()
		})

		it.each([
			[4.5, 5],
			[4.4, 4],
			[0.2, 1],
		])('дробное %s округляет до %s с предупреждением', (value, expected) => {
			expect(countProp({ ...base, value, fallback: 5 })).toBe(expected)
			expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining(`не целое число, используется ${expected}`))
		})

		it('0 и NaN заменяет на fallback', () => {
			expect(countProp({ ...base, value: 0, fallback: 5 })).toBe(5)
			expect(countProp({ ...base, value: Number.NaN, fallback: 5 })).toBe(5)
			expect(warnSpy).toHaveBeenCalledTimes(2)
		})
	})

	describe('nonNegativeProp', () => {
		it.each([0, 12.5])('пропускает %s', value => {
			expect(nonNegativeProp({ ...base, value })).toBe(value)
			expect(warnSpy).not.toHaveBeenCalled()
		})

		it.each([-1, Number.NaN, Number.POSITIVE_INFINITY])('%s не применяет', value => {
			expect(nonNegativeProp({ ...base, value })).toBeUndefined()
			expect(warnSpy).toHaveBeenCalledWith(`[rise-ui-kit] BaseX: \`size\` = ${value} — меньше 0, не применяется`)
		})
	})

	describe('orderedMax', () => {
		it('max не меньше min — без изменений', () => {
			expect(orderedMax('BaseX', 0, 0)).toBe(0)
			expect(orderedMax('BaseX', 0, 10)).toBe(10)
			expect(warnSpy).not.toHaveBeenCalled()
		})

		it('max меньше min сводит диапазон к min', () => {
			expect(orderedMax('BaseX', 5, 1)).toBe(5)
			expect(warnSpy).toHaveBeenCalledWith('[rise-ui-kit] BaseX: `max` = 1 меньше `min` = 5 — диапазон сведён к 5')
		})
	})

	it('предупреждение — на текущем языке', () => {
		setLocale('en')
		finiteProp({ ...base, value: Number.NaN, fallback: 0 })
		expect(warnSpy).toHaveBeenCalledWith('[rise-ui-kit] BaseX: `size` = NaN is not a finite number, 0 is used')
	})
})
