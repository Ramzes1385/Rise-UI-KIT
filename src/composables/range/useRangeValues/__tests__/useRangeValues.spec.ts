import { reactive } from 'vue'
import { useRangeValues } from '../useRangeValues'
import type { UseRangeValuesOptions } from '../types/useRangeValues.types'

type RangeProps = UseRangeValuesOptions['props']

function setup(props: Partial<RangeProps> = {}) {
	const state = reactive<RangeProps>({ min: 0, max: 100, step: 10, modelValue: 40, ...props })
	const emit = vi.fn()
	const range = useRangeValues({ props: state, emit: emit as unknown as UseRangeValuesOptions['emit'] })
	return { range, emit, state }
}

describe('useRangeValues', () => {
	describe('одиночное значение', () => {
		it('показывает значение, заливку от начала и позицию подсказки сверху', () => {
			const { range } = setup()
			expect(range.mode.value).toBe('single')
			expect(range.pointValues.value).toEqual([40])
			expect(range.labelText.value).toBe('40')
			expect(range.tooltipPosition.value).toBe('top')
			expect(range.fillSegments.value).toEqual([{ left: '0%', width: '40%' }])
		})

		it('обновляет modelValue и эмитит change', () => {
			const { range, emit } = setup()
			range.setPointValue(0, 73)
			expect(emit).toHaveBeenCalledWith('update:modelValue', 73)
			range.emitChange()
			expect(emit).toHaveBeenCalledWith('change', 40)
		})

		it('ограничивает значение границами', () => {
			const { range, emit } = setup()
			range.setPointValue(0, 150)
			expect(emit).toHaveBeenLastCalledWith('update:modelValue', 100)
			range.setPointValue(0, -5)
			expect(emit).toHaveBeenLastCalledWith('update:modelValue', 0)
		})
	})

	describe('диапазон', () => {
		it('показывает оба значения и одну заливку между ними', () => {
			const { range } = setup({ rangeValue: [20, 70] })
			expect(range.mode.value).toBe('range')
			expect(range.pointValues.value).toEqual([20, 70])
			expect(range.labelText.value).toBe('20 — 70')
			expect(range.fillSegments.value).toEqual([{ left: '20%', width: '50%' }])
		})

		it('не даёт ползунку зайти за соседа и эмитит update:rangeValue', () => {
			const { range, emit } = setup({ rangeValue: [20, 70] })
			range.setPointValue(0, 90)
			expect(emit).toHaveBeenLastCalledWith('update:rangeValue', [70, 70])
			range.setPointValue(1, 5)
			expect(emit).toHaveBeenLastCalledWith('update:rangeValue', [20, 20])
		})

		it('эмитит change с текущими или переданными значениями', () => {
			const { range, emit } = setup({ rangeValue: [20, 70] })
			range.emitChange()
			expect(emit).toHaveBeenLastCalledWith('change', [20, 70])
			range.emitChange([30, 70])
			expect(emit).toHaveBeenLastCalledWith('change', [30, 70])
		})
	})

	describe('несколько точек', () => {
		it('строит сегменты между соседними точками и границы для каждой', () => {
			const { range } = setup({ points: [10, 40, 80] })
			expect(range.mode.value).toBe('points')
			expect(range.labelText.value).toBe('10 — 40 — 80')
			expect(range.fillSegments.value).toEqual([
				{ left: '10%', width: '30%' },
				{ left: '40%', width: '40%' },
			])
			expect([range.thumbMin(0), range.thumbMax(0)]).toEqual([0, 40])
			expect([range.thumbMin(1), range.thumbMax(1)]).toEqual([10, 80])
			expect([range.thumbMin(2), range.thumbMax(2)]).toEqual([40, 100])
		})

		it('эмитит update:points и change копией значений', () => {
			const points = [10, 40, 80]
			const { range, emit } = setup({ points })
			range.setPointValue(1, 55)
			expect(emit).toHaveBeenLastCalledWith('update:points', [10, 55, 80])
			range.emitChange()
			const [, payload] = emit.mock.calls.at(-1)!
			expect(payload).toEqual([10, 40, 80])
			expect(payload).not.toBe(points)
		})
	})

	describe('вертикальная ориентация', () => {
		it('считает позиции снизу и показывает подсказку справа', () => {
			const { range } = setup({ isVertical: true, rangeValue: [20, 70] })
			expect(range.tooltipPosition.value).toBe('right')
			expect(range.fillSegments.value).toEqual([{ bottom: '20%', height: '50%' }])
			expect(range.thumbStyle(30)).toEqual({ bottom: '30%' })
			expect(range.markStyle(50)).toEqual({ bottom: '50%' })
		})
	})

	it('размещает ползунок и метку по горизонтали', () => {
		const { range } = setup()
		expect(range.thumbStyle(30)).toEqual({ left: '30%' })
		expect(range.markStyle(50)).toEqual({ left: '50%' })
	})

	it('заливка корректна, когда точки идут по убыванию', () => {
		const { range } = setup({ points: [80, 30] })
		expect(range.fillSegments.value).toEqual([{ left: '30%', width: '50%' }])
	})

	it('округляет к шагу и держит результат в границах', () => {
		const { range } = setup({ min: 0, max: 95, step: 10 })
		expect(range.snapToStepValue(34)).toBe(30)
		expect(range.snapToStepValue(96)).toBeLessThanOrEqual(95)
		expect(range.snapToStepValue(-20)).toBe(0)
	})
})
