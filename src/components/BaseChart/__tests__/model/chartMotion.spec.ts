import type { ChartMotionState } from '../../types/BaseChart.types'
import { baselineState, motionStructure, packMotion, unpackMotion } from '../../model/chart/chartMotion'

const state: ChartMotionState = {
	min: -10,
	max: 20,
	slots: [
		{ offset: 0.15, width: 0.35 },
		{ offset: 0.5, width: 0 },
	],
	spans: [
		[[0, 5], null],
		[
			[5, 8],
			[0, -3],
		],
	],
}

describe('состояние перехода графика', () => {
	it('упаковывает в массив чисел и распаковывает обратно; пропуск — NaN', () => {
		const vector = packMotion(state)
		expect(vector).toEqual([-10, 20, 0.15, 0.35, 0.5, 0, 0, 5, Number.NaN, Number.NaN, 5, 8, 0, -3])
		expect(unpackMotion(vector, 2, 2)).toEqual(state)
	})

	it('отрезок с нечисловым концом распаковывается пропуском', () => {
		expect(unpackMotion([0, 1, 0.2, 0.6, 1, Number.POSITIVE_INFINITY], 1, 1).spans).toEqual([[null]])
	})

	it('базовая линия — ноль в пределах шкалы, иначе ближайшая граница', () => {
		expect(baselineState(state).spans).toEqual([
			[[0, 0], null],
			[
				[0, 0],
				[0, 0],
			],
		])
		expect(baselineState({ ...state, min: 2, max: 8 }).spans[0][0]).toEqual([2, 2])
		expect(baselineState({ ...state, min: -8, max: -2 }).spans[0][0]).toEqual([-2, -2])
		expect(baselineState(state).slots).toBe(state.slots)
	})

	it('структура: раскладка и маска пропусков', () => {
		expect(motionStructure(state.spans, 'bar')).toBe('bar|10/11')
		expect(motionStructure([[null, [0, 1]]], 'line')).toBe('line|01')
	})
})
