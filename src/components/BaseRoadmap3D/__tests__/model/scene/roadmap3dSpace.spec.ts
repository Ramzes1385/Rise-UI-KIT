import { Color } from 'three'
import { testPalette } from '../../fixtures/model.test-utils'
import { mixColor, roadmapColors } from '../../../model/scene/roadmap3dPalette'
import {
	PEDESTAL,
	SLAB,
	STEP,
	frameCenter,
	pinPosition,
	roadmapFrame,
	toFraming,
	toWorld,
	worldBounds,
} from '../../../model/scene/roadmap3dSpace'

const BOUNDS = { minX: -4, maxX: 6, minZ: -2, maxZ: 8 }

describe('roadmap3dSpace', () => {
	it('toWorld переворачивает z острова', () => {
		expect(toWorld({ x: 1, z: 2 }, 3).toArray()).toEqual([1, 3, -2])
		expect(toWorld({ x: 1, z: 2 }).y).toBe(0)
	})

	it('worldBounds: от нижнего уступа до неба, z с обратным знаком', () => {
		const box = worldBounds(BOUNDS)
		expect(box.min.toArray()).toEqual([-4, -SLAB - STEP * 3, -8])
		expect(box.max.toArray()).toEqual([6, 3.2, 2])
	})

	it('roadmapFrame: радиус — половина диагонали, но не меньше 1', () => {
		const frame = roadmapFrame(BOUNDS)
		expect(frame.radius).toBeCloseTo(Math.hypot(10, 10) / 2)
		expect(frame.halfHeight).toBeCloseTo((3.2 + SLAB + STEP * 3) / 2)
		expect(roadmapFrame({ minX: 0, maxX: 0, minZ: 0, maxZ: 0 }).radius).toBe(1)
	})

	it('toFraming, frameCenter и pinPosition', () => {
		const frame = roadmapFrame(BOUNDS)
		expect(toFraming(frame)).toMatchObject({ bounds: frame.bounds, radius: frame.radius, halfHeight: frame.halfHeight })
		expect(frameCenter(frame).toArray()).toEqual([1, 0, -3])
		expect(pinPosition({ x: 2, z: 3 }).y).toBeGreaterThan(PEDESTAL)
		expect(pinPosition({ x: 2, z: 3 }).z).toBe(-3)
	})
})

describe('roadmap3dPalette', () => {
	it('mixColor смешивает копию и не трогает исходные цвета', () => {
		const from = new Color('#000000')
		const mixed = mixColor(from, new Color('#ffffff'), 0.5)
		expect(mixed.r).toBeCloseTo(0.5)
		expect(from.r).toBe(0)
	})

	it('roadmapColors: полный набор цветов, три уступа темнеют', () => {
		const colors = roadmapColors(testPalette())
		expect(colors.cliffs).toHaveLength(3)
		expect(colors.cliffs[2].r).toBeLessThanOrEqual(colors.cliffs[0].r)
		expect(colors.cones).toHaveLength(3)
		Object.entries(colors).forEach(([, value]) => expect(value).toBeDefined())
	})
})
