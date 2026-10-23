import { clampView, cropToView, imageStyle, initialView, panView, sameCrop, unitSize, viewToCrop } from '../../model/crop/cropGeometry'

const LANDSCAPE = { width: 800, height: 500 }

describe('геометрия кадра', () => {
	it('начальный кадр — по центру без увеличения, во весь меньший край', () => {
		const view = initialView(LANDSCAPE)
		expect(view).toEqual({ zoom: 1, centerX: 400, centerY: 250 })
		expect(viewToCrop(view, LANDSCAPE)).toEqual({ x: 150, y: 0, size: 500 })
	})

	it('увеличение от 1 до maxZoom, кадр не выходит за края фото', () => {
		expect(clampView({ zoom: 0.5, centerX: 0, centerY: 900 }, LANDSCAPE, 4)).toEqual({ zoom: 1, centerX: 250, centerY: 250 })
		expect(clampView({ zoom: 9, centerX: 900, centerY: 0 }, LANDSCAPE, 4)).toEqual({ zoom: 4, centerX: 737.5, centerY: 62.5 })
		expect(clampView({ zoom: 2, centerX: 10, centerY: 10 }, LANDSCAPE, 0.5).zoom).toBe(1)
	})

	it('кадр в целых пикселях и внутри фото', () => {
		expect(viewToCrop({ zoom: 3, centerX: 799, centerY: 1 }, LANDSCAPE)).toEqual({ x: 633, y: 0, size: 167 })
	})

	it('кадр из v-model переводится в масштаб и центр', () => {
		expect(cropToView({ x: 440, y: 120, size: 250 }, LANDSCAPE, 4)).toEqual({ zoom: 2, centerX: 565, centerY: 245 })
		expect(cropToView({ x: 0, y: 0, size: 0 }, LANDSCAPE, 4)).toEqual({ zoom: 4, centerX: 62.5, centerY: 62.5 })
	})

	it('сравнение кадров', () => {
		expect(sameCrop({ x: 1, y: 2, size: 3 }, { x: 1, y: 2, size: 3 })).toBe(true)
		expect(sameCrop({ x: 1, y: 2, size: 3 }, { x: 1, y: 2, size: 4 })).toBe(false)
		expect(sameCrop(undefined, { x: 1, y: 2, size: 3 })).toBe(false)
	})

	it('сдвиг: фото едет за указателем, пиксели экрана переводятся в пиксели фото', () => {
		const pixelsPerUnit = unitSize({ zoom: 2, centerX: 400, centerY: 250 }, LANDSCAPE, 250)
		expect(pixelsPerUnit).toBeCloseTo(0.84)
		expect(panView({ zoom: 2, centerX: 400, centerY: 250 }, { x: 42, y: -21 }, pixelsPerUnit)).toEqual({
			zoom: 2,
			centerX: 350,
			centerY: 275,
		})
	})

	it('положение фото в области — в процентах: кадр занимает 84% области', () => {
		expect(imageStyle(initialView(LANDSCAPE), LANDSCAPE)).toEqual({
			aspectRatio: '800 / 500',
			transform: 'translate(-17.2%, 12.8%) scale(1.344)',
		})
	})
})
