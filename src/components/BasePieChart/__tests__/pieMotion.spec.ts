import { segmentViews } from '../model/chart/pieGeometry'
import { cssTimeToMs, initialSegments, mergeSegments } from '../model/chart/pieMotion'

const color = 'red'
const views = (pairs: Array<[string, number]>) => segmentViews(pairs.map(([label, value]) => ({ label, value, color })))

describe('pieMotion', () => {
	it('initialSegments: sweep — начало и доля 0…1 для задержки и длительности; без sweep — static', () => {
		const segments = initialSegments(
			views([
				['A', 3],
				['B', 1],
			]),
			true,
		)

		expect(segments.map(segment => [segment.entry, segment.enter, segment.isLeaving])).toEqual([
			['sweep', { start: 0, share: 0.75 }, false],
			['sweep', { start: 0.75, share: 0.25 }, false],
		])
		expect(segments[1].dash).toBe('24.2 75.8')
		expect(segments[1].offset).toBe(-50)
		expect(initialSegments(views([['A', 1]]), false)[0].entry).toBe('static')
	})

	it('mergeSegments: новая геометрия по label, вход и начало появления не меняются; новый — added', () => {
		const previous = initialSegments(
			views([
				['A', 1],
				['B', 1],
			]),
			true,
		)
		const next = mergeSegments(
			previous,
			views([
				['B', 3],
				['A', 1],
				['C', 4],
			]),
			{ isAnimated: true },
		)

		expect(next.map(segment => [segment.label, segment.entry, segment.dash, segment.isLeaving])).toEqual([
			['B', 'sweep', '36.7 63.3', false],
			['A', 'sweep', '11.7 88.3', false],
			['C', 'added', '49.2 50.8', false],
		])
		expect(next[0].enter).toEqual({ start: 0.5, share: 0.5 })
		expect(next[2].enter).toEqual({ start: 0.5, share: 0.5 })
		expect(mergeSegments(previous, views([['D', 1]]), { isAnimated: false }).map(segment => [segment.label, segment.entry])).toEqual([
			['D', 'static'],
		])
	})

	it('mergeSegments: ушедший сжимается до нуля на своём месте и остаётся, пока не удалят; вернувшийся оживает', () => {
		const previous = initialSegments(
			views([
				['A', 1],
				['B', 1],
				['C', 1],
			]),
			false,
		)
		const leaving = mergeSegments(previous, views([['A', 1]]), { isAnimated: true })

		expect(leaving.map(segment => [segment.label, segment.dash, segment.isLeaving])).toEqual([
			['A', '100 0', false],
			['B', '0 100', true],
			['C', '0 100', true],
		])
		expect(leaving[1].offset).toBe(previous[1].offset)
		const still = mergeSegments(leaving, views([['A', 1]]), { isAnimated: true })
		expect(still[1]).toBe(leaving[1])
		const back = mergeSegments(
			leaving,
			views([
				['A', 1],
				['C', 1],
			]),
			{ isAnimated: true },
		)
		expect(back.map(segment => [segment.label, segment.isLeaving, segment.entry])).toEqual([
			['A', false, 'static'],
			['B', true, 'static'],
			['C', false, 'static'],
		])
		expect(back[2].dash).toBe('49.2 50.8')
	})

	it('cssTimeToMs: секунды, миллисекунды, список — наибольшее; пусто и мусор — 0', () => {
		expect(cssTimeToMs('0.3s')).toBe(300)
		expect(cssTimeToMs(' 250ms ')).toBe(250)
		expect(cssTimeToMs('0.5s, 150ms')).toBe(500)
		expect(cssTimeToMs('')).toBe(0)
		expect(cssTimeToMs('var(--x)')).toBe(0)
	})
})
