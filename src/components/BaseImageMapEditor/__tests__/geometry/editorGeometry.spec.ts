import type { ImageMapObject } from '../../../BaseImageMap/types/imageMapData.types'
import {
	clamp,
	clampPoint,
	createShape,
	dragBounds,
	dragHandle,
	objectHandles,
	round,
	translateObject,
} from '../../model/geometry/editorGeometry'

function rect(): ImageMapObject {
	return { id: 'rect-1', title: '', type: 'rect', x: 0.2, y: 0.2, width: 0.2, height: 0.2 }
}

function ellipse(): ImageMapObject {
	return { id: 'ellipse-1', title: '', type: 'ellipse', x: 0.5, y: 0.5, rx: 0.1, ry: 0.2 }
}

function polygon(): ImageMapObject {
	return {
		id: 'polygon-1',
		title: '',
		type: 'polygon',
		points: [
			[0.1, 0.1],
			[0.3, 0.1],
			[0.2, 0.4],
		],
	}
}

function point(): ImageMapObject {
	return { id: 'point-1', title: '', type: 'point', x: 0.5, y: 0.5 }
}

function svg(): ImageMapObject {
	return { id: 'svg-1', title: '', type: 'svg', elementId: 'shop' }
}

describe('editorGeometry: числа', () => {
	it('round округляет до 4 знаков', () => {
		expect(round(0.123456)).toBe(0.1235)
		expect(round(1)).toBe(1)
	})

	it('clamp прижимает к 0–1 и к своим границам', () => {
		expect(clamp(-1)).toBe(0)
		expect(clamp(2)).toBe(1)
		expect(clamp(0.5)).toBe(0.5)
		expect(clamp(5, -2, 3)).toBe(3)
		expect(clamp(-5, -2, 3)).toBe(-2)
	})

	it('clampPoint прижимает и округляет точку', () => {
		expect(clampPoint({ x: -0.3, y: 1.4 })).toEqual({ x: 0, y: 1 })
		expect(clampPoint({ x: 0.123456, y: 0.5 })).toEqual({ x: 0.1235, y: 0.5 })
	})
})

describe('editorGeometry: dragBounds', () => {
	it('клик даёт 10%×10% с центром в точке', () => {
		const area = dragBounds({ x: 0.5, y: 0.5 }, { x: 0.505, y: 0.509 })
		expect(area.x).toBeCloseTo(0.45)
		expect(area.y).toBeCloseTo(0.45)
		expect(area.width).toBe(0.1)
		expect(area.height).toBe(0.1)
	})

	it('клик у края прижат', () => {
		const area = dragBounds({ x: 0.98, y: 0.01 }, { x: 0.98, y: 0.01 })
		expect(area).toEqual({ x: 0.9, y: 0, width: 0.1, height: 0.1 })
	})

	it('протяжка вправо-вниз и влево-вверх даёт одну рамку', () => {
		const forward = dragBounds({ x: 0.1, y: 0.2 }, { x: 0.4, y: 0.6 })
		const backward = dragBounds({ x: 0.4, y: 0.6 }, { x: 0.1, y: 0.2 })
		expect(backward).toEqual(forward)
		expect(forward.x).toBeCloseTo(0.1)
		expect(forward.y).toBeCloseTo(0.2)
		expect(forward.width).toBeCloseTo(0.3)
		expect(forward.height).toBeCloseTo(0.4)
	})

	it('протяжка по одной оси даёт минимум 0.005 по другой', () => {
		expect(dragBounds({ x: 0.1, y: 0.5 }, { x: 0.5, y: 0.5 })).toMatchObject({ height: 0.005 })
		expect(dragBounds({ x: 0.5, y: 0.1 }, { x: 0.5, y: 0.5 })).toMatchObject({ width: 0.005 })
	})

	it('протяжка за пределы картинки прижата', () => {
		expect(dragBounds({ x: 0.5, y: 0.5 }, { x: 1.5, y: -0.5 })).toEqual({ x: 0.5, y: 0, width: 0.5, height: 0.5 })
	})
})

describe('editorGeometry: translateObject', () => {
	it('сдвигает прямоугольник', () => {
		const object = rect()
		translateObject(object, { x: 0.1, y: -0.1 })
		expect(object).toMatchObject({ x: 0.3, y: 0.1 })
	})

	it('не выводит прямоугольник за 0–1', () => {
		const object = rect()
		translateObject(object, { x: 5, y: -5 })
		expect(object).toMatchObject({ x: 0.8, y: 0 })
	})

	it('не выводит эллипс за 0–1', () => {
		const object = ellipse()
		translateObject(object, { x: -5, y: 5 })
		expect(object).toMatchObject({ x: 0.1, y: 0.8 })
	})

	it('не выводит точку за 0–1', () => {
		const object = point()
		translateObject(object, { x: 2, y: -2 })
		expect(object).toMatchObject({ x: 1, y: 0 })
	})

	it('сдвигает многоугольник целиком с прижатием', () => {
		const object = polygon()
		translateObject(object, { x: -1, y: 1 })
		expect(object).toMatchObject({
			points: [
				[0, 0.7],
				[0.2, 0.7],
				[0.1, 1],
			],
		})
	})

	it('svg не двигается', () => {
		const object = svg()
		translateObject(object, { x: 0.1, y: 0.1 })
		expect(object).toEqual(svg())
	})
})

describe('editorGeometry: ручки', () => {
	it('у прямоугольника 4 угла по часовой', () => {
		expect(objectHandles(rect())).toEqual([
			{ index: 0, x: 0.2, y: 0.2 },
			{ index: 1, x: 0.4, y: 0.2 },
			{ index: 2, x: 0.4, y: 0.4 },
			{ index: 3, x: 0.2, y: 0.4 },
		])
	})

	it('у эллипса 4 угла рамки', () => {
		const handles = objectHandles(ellipse())
		expect(handles).toHaveLength(4)
		expect(handles[0]).toMatchObject({ index: 0, y: 0.3 })
		expect(handles[0]?.x).toBeCloseTo(0.4)
		expect(handles[2]?.x).toBeCloseTo(0.6)
		expect(handles[2]?.y).toBeCloseTo(0.7)
	})

	it('у многоугольника ручки — вершины', () => {
		expect(objectHandles(polygon())).toEqual([
			{ index: 0, x: 0.1, y: 0.1 },
			{ index: 1, x: 0.3, y: 0.1 },
			{ index: 2, x: 0.2, y: 0.4 },
		])
	})

	it('у точки и svg ручек нет', () => {
		expect(objectHandles(point())).toEqual([])
		expect(objectHandles(svg())).toEqual([])
	})
})

describe('editorGeometry: dragHandle', () => {
	it('прямоугольник: противоположный угол закреплён', () => {
		const origin = rect()
		const object = rect()
		dragHandle(object, origin, { index: 2, point: { x: 0.6, y: 0.7 } })
		expect(object).toMatchObject({ x: 0.2, y: 0.2, width: 0.4, height: 0.5 })
	})

	it('прямоугольник: ручку можно перетащить за противоположный угол', () => {
		const origin = rect()
		const object = rect()
		dragHandle(object, origin, { index: 0, point: { x: 0.5, y: 0.5 } })
		expect(object).toMatchObject({ x: 0.4, y: 0.4, width: 0.1, height: 0.1 })
	})

	it('прямоугольник: минимум 0.005', () => {
		const origin = rect()
		const object = rect()
		dragHandle(object, origin, { index: 2, point: { x: 0.2, y: 0.2 } })
		expect(object).toMatchObject({ x: 0.2, y: 0.2, width: 0.005, height: 0.005 })
	})

	it('эллипс: противоположный угол закреплён, центр и радиусы пересчитаны', () => {
		const origin = ellipse()
		const object = ellipse()
		dragHandle(object, origin, { index: 1, point: { x: 0.8, y: 0.1 } })
		expect(object).toMatchObject({ x: 0.6, y: 0.4, rx: 0.2, ry: 0.3 })
	})

	it('многоугольник: двигается только вершина, точка прижата', () => {
		const origin = polygon()
		const object = polygon()
		dragHandle(object, origin, { index: 1, point: { x: 1.5, y: -0.2 } })
		expect(object).toMatchObject({
			points: [
				[0.1, 0.1],
				[1, 0],
				[0.2, 0.4],
			],
		})
	})

	it('исходник без рамки — без изменений', () => {
		const object = rect()
		dragHandle(object, svg(), { index: 0, point: { x: 0.9, y: 0.9 } })
		expect(object).toEqual(rect())
	})

	it('объект без рамки не меняется', () => {
		const object = svg()
		dragHandle(object, rect(), { index: 0, point: { x: 0.1, y: 0.1 } })
		expect(object).toEqual(svg())
	})

	it('точка не меняется', () => {
		const object = point()
		dragHandle(object, point(), { index: 0, point: { x: 0.1, y: 0.1 } })
		expect(object).toEqual(point())
	})
})

describe('editorGeometry: createShape', () => {
	it('прямоугольник по рамке', () => {
		expect(createShape('rect', { x: 0.12345, y: 0.2, width: 0.3, height: 0.4 })).toEqual({
			type: 'rect',
			x: 0.1235,
			y: 0.2,
			width: 0.3,
			height: 0.4,
		})
	})

	it('эллипс вписан в рамку', () => {
		expect(createShape('ellipse', { x: 0.2, y: 0.2, width: 0.4, height: 0.2 })).toEqual({
			type: 'ellipse',
			x: 0.4,
			y: 0.3,
			rx: 0.2,
			ry: 0.1,
		})
	})
})
