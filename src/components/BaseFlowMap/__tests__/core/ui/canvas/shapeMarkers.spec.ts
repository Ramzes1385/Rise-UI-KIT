import { placeMarkers } from '../../../../model/render/shapes/shapeMarkers'

const size = { width: 100, height: 60 }

describe('placeMarkers', () => {
	it('отбрасывает знаки без текста и пути', () => {
		expect(placeMarkers([{ placement: 'center' }], size)).toEqual([])
	})

	it('ставит текст по углам и низу, якорь зависит от стороны', () => {
		const [start, end, middle] = placeMarkers(
			[
				{ text: 'a', placement: 'top-start' },
				{ text: 'b', placement: 'bottom-end' },
				{ text: 'c', placement: 'bottom-center' },
			],
			size,
		)
		expect(start).toMatchObject({ x: 6, y: 11, anchor: 'start', text: 'a' })
		expect(end).toMatchObject({ x: 94, y: 49, anchor: 'end' })
		expect(middle).toMatchObject({ x: 50, y: 49, anchor: 'middle' })
	})

	it('контурные знаки сдвигаются на свой размер, центральный крупнее, заливка передаётся', () => {
		const [centered, corner, right] = placeMarkers(
			[
				{ path: 'M0 0', placement: 'center', isFilled: true },
				{ path: 'M0 0', placement: 'top-start' },
				{ path: 'M0 0', placement: 'top-end' },
			],
			size,
		)
		expect(centered).toMatchObject({ x: 40, y: 20, scale: 20 / 24, isFilled: true })
		expect(corner).toMatchObject({ x: 6, y: 3, scale: 16 / 24, isFilled: false })
		expect(right.x).toBe(94 - 16)
		expect(new Set([centered.key, corner.key, right.key]).size).toBe(3)
	})
})
