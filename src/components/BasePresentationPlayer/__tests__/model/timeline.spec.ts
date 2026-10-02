import { clampIndex, fraction, indexAtTime, safeUrl, slideSpan, trackStarts } from '../../model/playback/timeline'

describe('timeline', () => {
	it('safeUrl пропускает http, https, blob, data и относительные адреса, отбрасывает javascript:', () => {
		expect(safeUrl('/a.png')).toBe('/a.png')
		expect(safeUrl('https://x.test/a.webm')).toBe('https://x.test/a.webm')
		expect(safeUrl('data:audio/webm;base64,AA')).toBe('data:audio/webm;base64,AA')
		expect(safeUrl('javascript:alert(1)')).toBeUndefined()
		expect(safeUrl(undefined)).toBeUndefined()
		expect(safeUrl('')).toBeUndefined()
	})

	it('clampIndex держит номер в пределах и отбрасывает дробную часть', () => {
		expect(clampIndex(-3, 5)).toBe(0)
		expect(clampIndex(9, 5)).toBe(4)
		expect(clampIndex(2.7, 5)).toBe(2)
		expect(clampIndex(Number.NaN, 5)).toBe(0)
		expect(clampIndex(3, 0)).toBe(0)
	})

	it('trackStarts берёт at, а без него — начало предыдущего плюс его duration', () => {
		expect(
			trackStarts([
				{ id: 'a', title: 'A', duration: 4 },
				{ id: 'b', title: 'B' },
				{ id: 'c', title: 'C', at: 10 },
				{ id: 'd', title: 'D', at: -5 },
			]),
		).toEqual([0, 4, 10, 0])
	})

	it('indexAtTime находит слайд по времени дорожки с допуском 0,05 с', () => {
		const starts = [0, 4, 10]
		expect(indexAtTime(starts, 0)).toBe(0)
		expect(indexAtTime(starts, 3.96)).toBe(1)
		expect(indexAtTime(starts, 9)).toBe(1)
		expect(indexAtTime(starts, 30)).toBe(2)
	})

	it('slideSpan: конец — начало следующего, у последнего — длительность дорожки', () => {
		expect(slideSpan([0, 4, 10], 1, 20)).toEqual([4, 10])
		expect(slideSpan([0, 4, 10], 2, 20)).toEqual([10, 20])
		expect(slideSpan([], 3, 20)).toEqual([0, 20])
	})

	it('fraction — доля от 0 до 1, при неизвестной длительности 0', () => {
		expect(fraction(5, 10)).toBe(0.5)
		expect(fraction(15, 10)).toBe(1)
		expect(fraction(-1, 10)).toBe(0)
		expect(fraction(5, Number.NaN)).toBe(0)
		expect(fraction(5, Number.POSITIVE_INFINITY)).toBe(0)
		expect(fraction(5, 0)).toBe(0)
	})
})
