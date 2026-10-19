import { Color, Vector3 } from 'three'
import { roundedLoop } from '../../geometry/roundedLoop'
import { createRibbonGeometry, createRibbonMaterial, setRibbonLength } from '../../geometry/ribbon'

const p = (x: number, y: number, z: number) => ({ x, y, z })
const attr = (geometry: ReturnType<typeof createRibbonGeometry>, name: string) => Array.from(geometry.getAttribute(name).array)

describe('createRibbonGeometry', () => {
	it('прямая: две вершины на точку, сдвиг в обе стороны, along — длина пути', () => {
		const geometry = createRibbonGeometry([p(0, 0, 0), p(2, 0, 0), p(5, 0, 0)])
		expect(geometry.getAttribute('position').count).toBe(6)
		expect(attr(geometry, 'along')).toEqual([0, 0, 2, 2, 5, 5])
		const offset = attr(geometry, 'offsetDir')
		expect(offset[0]).toBeCloseTo(0)
		expect(offset[2]).toBeCloseTo(1)
		expect(offset[5]).toBeCloseTo(-1)
		expect(geometry.userData.length).toBe(5)
		expect(Array.from(geometry.index?.array ?? [])).toEqual([0, 1, 2, 1, 3, 2, 2, 3, 4, 3, 5, 4])
	})

	it('длина пути учитывает высоту точек', () => {
		expect(createRibbonGeometry([p(0, 0, 0), p(0, 3, 4)]).userData.length).toBe(5)
	})

	it('угол 90°: сдвиг растёт по миттеру (длина √2)', () => {
		const offset = attr(createRibbonGeometry([p(0, 0, 0), p(1, 0, 0), p(1, 0, 1)]), 'offsetDir')
		expect(Math.hypot(offset[6], offset[8])).toBeCloseTo(Math.SQRT2)
		expect(offset[9]).toBeCloseTo(-offset[6])
	})

	it('острый излом: косинус не меньше 0,35, сдвиг не растёт без предела', () => {
		const offset = attr(createRibbonGeometry([p(0, 0, 0), p(1, 0, 0), p(0, 0, 0.01)]), 'offsetDir')
		expect(Math.hypot(offset[6], offset[8])).toBeLessThanOrEqual(1 / 0.35 + 1e-6)
		expect(Math.hypot(offset[6], offset[8])).toBeGreaterThan(2.5)
	})

	it('концы открытой ленты: сдвиг перпендикулярен единственному соседнему отрезку', () => {
		const offset = attr(createRibbonGeometry([p(0, 0, 0), p(0, 0, 4)]), 'offsetDir')
		expect(offset[0]).toBeCloseTo(-1)
		expect(offset[2]).toBeCloseTo(0)
		expect(offset[6]).toBeCloseTo(-1)
	})

	it('замкнутая: первая и последняя вершины делят один сдвиг (стык без излома)', () => {
		const square = [p(0, 0, 0), p(1, 0, 0), p(1, 0, 1), p(0, 0, 1), p(0, 0, 0)]
		const offset = attr(createRibbonGeometry(square, true), 'offsetDir')
		expect(offset.slice(0, 3)).toEqual(offset.slice(-6, -3))
		expect(Math.hypot(offset[0], offset[2])).toBeCloseTo(Math.SQRT2)
	})

	it('открытая лента с теми же точками сдвигает концы иначе, чем замкнутая', () => {
		const square = [p(0, 0, 0), p(1, 0, 0), p(1, 0, 1), p(0, 0, 1), p(0, 0, 0)]
		const open = attr(createRibbonGeometry(square), 'offsetDir')
		expect(Math.hypot(open[0], open[2])).toBeCloseTo(1)
	})

	it('совпадающие точки и единственная точка не дают NaN', () => {
		const same = attr(createRibbonGeometry([p(1, 0, 1), p(1, 0, 1)]), 'offsetDir')
		const single = attr(createRibbonGeometry([p(1, 0, 1)]), 'offsetDir')
		expect([...same, ...single].every(Number.isFinite)).toBe(true)
		expect(createRibbonGeometry([]).userData.length).toBe(0)
	})
})

describe('createRibbonMaterial и setRibbonLength', () => {
	it('сплошная лента: значения по умолчанию', () => {
		const color = new Color('#ff0000')
		const material = createRibbonMaterial({ color, width: 0.2 })
		const { uniforms } = material
		expect(uniforms.uColor.value).not.toBe(color)
		expect(uniforms.uColor.value.getHex()).toBe(color.getHex())
		expect([uniforms.uWidth.value, uniforms.uOpacity.value, uniforms.uDashed.value]).toEqual([0.2, 1, 0])
		expect([uniforms.uDash.value, uniforms.uGap.value, uniforms.uOffset.value]).toEqual([0.24, 0.16, 0])
		expect([uniforms.uProgress.value, uniforms.uLength.value]).toEqual([1, 1])
		expect(material.transparent).toBe(true)
	})

	it('пунктир и непрозрачность', () => {
		const { uniforms } = createRibbonMaterial({ color: new Color(), width: 1, opacity: 0.5, dash: { dash: 2, gap: 1 } })
		expect([uniforms.uDashed.value, uniforms.uDash.value, uniforms.uGap.value, uniforms.uOpacity.value]).toEqual([1, 2, 1, 0.5])
	})

	it('setRibbonLength берёт длину геометрии, пустая длина даёт 1', () => {
		const material = createRibbonMaterial({ color: new Color(), width: 1 })
		setRibbonLength(material, createRibbonGeometry([p(0, 0, 0), p(0, 0, 7)]))
		expect(material.uniforms.uLength.value).toBe(7)
		setRibbonLength(material, createRibbonGeometry([p(0, 0, 0)]))
		expect(material.uniforms.uLength.value).toBe(1)
	})
})

describe('roundedLoop', () => {
	const rect = { x0: 0, z0: 0, x1: 10, z1: 4 }

	it('замкнута: последняя точка равна первой, но это другой объект', () => {
		const points = roundedLoop(rect, { radius: 1, y: 0.5 })
		expect(points).toHaveLength(4 * 11 + 1)
		expect(points[points.length - 1]).not.toBe(points[0])
		expect(points[points.length - 1].equals(points[0])).toBe(true)
		expect(points.every(point => point.y === 0.5)).toBe(true)
	})

	it('радиус больше половины меньшей стороны сжимается до неё', () => {
		const points = roundedLoop(rect, { radius: 50, y: 0, segments: 4 })
		const xs = points.map(point => point.x)
		const zs = points.map(point => point.z)
		expect([Math.min(...xs), Math.max(...xs)].map(v => Math.round(v * 1e6) / 1e6)).toEqual([0, 10])
		expect([Math.min(...zs), Math.max(...zs)].map(v => Math.round(v * 1e6) / 1e6)).toEqual([0, 4])
		expect(points).toHaveLength(4 * 5 + 1)
		expect(points[0].distanceTo(new Vector3(8, 0, 0))).toBeCloseTo(0, 5)
	})

	it('отрицательный радиус — острые углы', () => {
		const points = roundedLoop(rect, { radius: -3, y: 0, segments: 1 })
		expect(points.some(point => Math.abs(point.x - 10) < 1e-9 && Math.abs(point.z) < 1e-9)).toBe(true)
	})
})
