import { chartDomain, seriesSpans, spanExtent, stackSpans } from '../../model/chart/chartScale'

describe('шкала графика', () => {
	it('подбирает «круглые» шаги 1/2/5×10ⁿ', () => {
		expect(chartDomain([0, 240], 5)).toEqual({ min: 0, max: 250, ticks: [0, 50, 100, 150, 200, 250] })
		expect(chartDomain([-3, 7.3], 5)).toEqual({ min: -4, max: 8, ticks: [-4, -2, 0, 2, 4, 6, 8] })
		expect(chartDomain([0.1, 0.3], 5).ticks).toEqual([0.1, 0.15, 0.2, 0.25, 0.3])
		expect(chartDomain([0, 10], 10).ticks).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
	})

	it('расширяет шкалу у одного значения и у одних нулей', () => {
		expect(chartDomain([5], 5)).toEqual({ min: 2, max: 8, ticks: [2, 3, 4, 5, 6, 7, 8] })
		expect(chartDomain([-5, -5], 5)).toEqual({ min: -8, max: -2, ticks: [-8, -7, -6, -5, -4, -3, -2] })
		expect(chartDomain([0, 0], 5)).toEqual({ min: 0, max: 1, ticks: [0, 0.2, 0.4, 0.6, 0.8, 1] })
	})

	it('не падает при числе делений меньше единицы', () => {
		expect(chartDomain([0, 100], 0).ticks).toEqual([0, 100])
	})

	it('превращает значения в отрезки от нуля, пропуская null и нечисла', () => {
		expect(seriesSpans([3, null, Number.NaN, Number.POSITIVE_INFINITY, -2], 6)).toEqual([[0, 3], null, null, null, [0, -2], null])
	})

	it('копит стопку вверх и вниз раздельно, пропуская null', () => {
		expect(
			stackSpans(
				[
					[2, -1, null],
					[3, -4, 5],
				],
				3,
			),
		).toEqual([
			[[0, 2], [0, -1], null],
			[
				[2, 5],
				[-1, -5],
				[0, 5],
			],
		])
	})

	it('собирает границы: с нулём у area и bar, без нуля у line', () => {
		const spans = [[[0, 4] as const, null, [0, 6] as const]]
		expect(spanExtent(spans, true)).toEqual([0, 4, 6])
		expect(spanExtent(spans, false)).toEqual([4, 6])
		expect(spanExtent([[null]], false)).toEqual([0])
	})
})
