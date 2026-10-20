import { sampleTrack, tracksOf } from '../../model/motion/particles/edgeTracks'
import type { FlowMap3DEdgeItem } from '../../types/internal/flowMap3dInternal.types'

const edge = (id: string, points: Array<[number, number, number]>) =>
	({ id, points: points.map(([x, y, z]) => ({ x, y, z })) }) as unknown as FlowMap3DEdgeItem

describe('tracksOf', () => {
	it('считает накопленные длины и общую длину, а короткие и нулевые пути пропускает', () => {
		const tracks = tracksOf([
			edge('a', [
				[0, 0, 0],
				[3, 4, 0],
				[3, 4, 12],
			]),
			edge('short', [[0, 0, 0]]),
			edge('zero', [
				[1, 1, 1],
				[1, 1, 1],
			]),
		])
		expect([...tracks.keys()]).toEqual(['a'])
		expect(tracks.get('a')?.lengths).toEqual([0, 5, 17])
		expect(tracks.get('a')?.total).toBe(17)
	})
})

describe('sampleTrack', () => {
	const track = tracksOf([
		edge('a', [
			[0, 0, 0],
			[10, 0, 0],
			[10, 0, 10],
		]),
	]).get('a')!
	const spot = { x: 0, y: 0, z: 0 }

	it('находит точку на нужном отрезке', () => {
		sampleTrack(track, 5, spot)
		expect(spot).toEqual({ x: 5, y: 0, z: 0 })
		sampleTrack(track, 15, spot)
		expect(spot).toEqual({ x: 10, y: 0, z: 5 })
	})

	it('за пределами длины остаётся на краю', () => {
		sampleTrack(track, -4, spot)
		expect(spot).toEqual({ x: 0, y: 0, z: 0 })
		sampleTrack(track, 99, spot)
		expect(spot).toEqual({ x: 10, y: 0, z: 10 })
	})

	it('вырожденный отрезок нулевой длины не делит на ноль', () => {
		const flat = tracksOf([
			edge('b', [
				[0, 0, 0],
				[0, 0, 0],
				[4, 0, 0],
			]),
		]).get('b')!
		sampleTrack(flat, 2, spot)
		expect(spot.x).toBe(2)
		const same = {
			points: [
				{ x: 1, y: 2, z: 3 },
				{ x: 1, y: 2, z: 3 },
			],
			lengths: [0, 0],
			total: 0,
		}
		sampleTrack(same, 0, spot)
		expect(spot).toEqual({ x: 1, y: 2, z: 3 })
	})
})
