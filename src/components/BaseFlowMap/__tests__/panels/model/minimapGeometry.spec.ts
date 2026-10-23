import { FLOW_MINIMAP_SIZE } from '../../../types/internal/flowPanels.types'
import {
	fromMinimapPoint,
	minimapTransform,
	pointInMinimap,
	toMinimapRect,
	viewportCenteredOn,
	viewportShiftedByKey,
	visibleCanvasRect,
} from '../../../model/panels/minimapGeometry'

describe('мини-карта: геометрия', () => {
	describe('minimapTransform', () => {
		it('вписывает содержимое в мини-карту с полем по краям и центрирует по короткой стороне', () => {
			const transform = minimapTransform({ x: 0, y: 0, width: 480, height: 100 })
			expect(transform.scale).toBeCloseTo((FLOW_MINIMAP_SIZE.width - 12) / 480, 6)
			expect(transform.offsetX).toBeCloseTo(6, 6)
			expect(transform.offsetY).toBeCloseTo((FLOW_MINIMAP_SIZE.height - 100 * transform.scale) / 2, 6)
		})

		it('высокое содержимое ограничено по высоте', () => {
			const transform = minimapTransform({ x: 0, y: 0, width: 100, height: 400 })
			expect(transform.scale).toBeCloseTo((FLOW_MINIMAP_SIZE.height - 12) / 400, 6)
		})

		it('учитывает сдвиг границ: левый верхний угол содержимого попадает в поле', () => {
			const transform = minimapTransform({ x: -20, y: -20, width: 480, height: 276 })
			const corner = toMinimapRect({ x: -20, y: -20, width: 0, height: 0 }, transform)
			expect(corner.x).toBeGreaterThanOrEqual(5.99)
			expect(corner.y).toBeGreaterThanOrEqual(5.99)
		})

		it('нулевые границы не дают деления на ноль', () => {
			const transform = minimapTransform({ x: 5, y: 5, width: 0, height: 0 })
			expect(Number.isFinite(transform.scale)).toBe(true)
			expect(Number.isFinite(transform.offsetX)).toBe(true)
		})

		it('принимает свой размер мини-карты', () => {
			const transform = minimapTransform({ x: 0, y: 0, width: 100, height: 100 }, { width: 112, height: 112 })
			expect(transform.scale).toBeCloseTo(1, 6)
		})
	})

	it('toMinimapRect и fromMinimapPoint обратимы', () => {
		const transform = minimapTransform({ x: -20, y: -20, width: 480, height: 276 })
		const rect = toMinimapRect({ x: 100, y: 40, width: 160, height: 56 }, transform)
		expect(rect.width).toBeCloseTo(160 * transform.scale, 6)
		const back = fromMinimapPoint({ x: rect.x, y: rect.y }, transform)
		expect(back.x).toBeCloseTo(100, 6)
		expect(back.y).toBeCloseTo(40, 6)
	})

	it('visibleCanvasRect: видимая часть холста при сдвиге и масштабе', () => {
		expect(visibleCanvasRect({ x: -100, y: -50, zoom: 2 }, { width: 800, height: 600 })).toEqual({
			x: 50,
			y: 25,
			width: 400,
			height: 300,
		})
		expect(visibleCanvasRect({ x: 0, y: 0, zoom: 1 }, { width: 800, height: 600 })).toEqual({ x: -0, y: -0, width: 800, height: 600 })
	})

	it('viewportCenteredOn ставит точку холста в центр рамки, масштаб не меняет', () => {
		expect(viewportCenteredOn({ x: 200, y: 100 }, { x: 5, y: 5, zoom: 2 }, { width: 800, height: 600 })).toEqual({
			zoom: 2,
			x: 400 - 400,
			y: 300 - 200,
		})
	})

	describe('viewportShiftedByKey', () => {
		const viewport = { x: 10, y: 20, zoom: 1.5 }
		const frame = { width: 1000, height: 500 }

		it.each([
			['ArrowRight', { x: -90, y: 20 }],
			['ArrowLeft', { x: 110, y: 20 }],
			['ArrowDown', { x: 10, y: -30 }],
			['ArrowUp', { x: 10, y: 70 }],
		])('%s сдвигает вид на десятую часть рамки (содержимое уходит в обратную сторону)', (key, expected) => {
			expect(viewportShiftedByKey(key, viewport, frame)).toEqual({ ...expected, zoom: 1.5 })
		})

		it('прочие клавиши вид не двигают', () => {
			expect(viewportShiftedByKey('Enter', viewport, frame)).toBeNull()
			expect(viewportShiftedByKey('a', viewport, frame)).toBeNull()
		})
	})

	it('pointInMinimap переводит координаты окна в координаты мини-карты', () => {
		expect(pointInMinimap({ clientX: 50, clientY: 70 }, { left: 20, top: 30 })).toEqual({ x: 30, y: 40 })
	})
})
