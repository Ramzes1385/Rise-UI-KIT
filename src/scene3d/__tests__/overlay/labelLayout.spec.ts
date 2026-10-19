import { OrthographicCamera, Vector3 } from 'three'
import { projectLabels, resolveOverlaps } from '../../overlay/labelLayout'
import type { Scene3DLabelBox, Scene3DLabelItem, Scene3DLabelSpot } from '../../types/internal/scene3dInternal.types'

const SIZE = { width: 200, height: 100 }

function camera() {
	const view = new OrthographicCamera(-10, 10, 5, -5, 0.1, 100)
	view.position.set(0, 10, 0)
	view.up.set(0, 0, -1)
	view.lookAt(0, 0, 0)
	view.updateMatrixWorld()
	return view
}

const item = (id: string, priority: number, isPinned?: boolean): Scene3DLabelItem => ({ id, anchor: new Vector3(), priority, isPinned })
const at = (x: number, y: number, isVisible = true): Scene3DLabelSpot => ({ x, y, isVisible })
const BOX: Scene3DLabelBox = { width: 20, height: 10 }

describe('projectLabels', () => {
	it('якоря переводятся в пиксели холста, вне кадра — невидимы', () => {
		const spots = projectLabels(
			[
				{ ...item('c', 1), anchor: new Vector3(0, 0, 0) },
				{ ...item('out', 1), anchor: new Vector3(50, 0, 0) },
			],
			camera(),
			SIZE,
		)
		expect(spots.get('c')?.x).toBeCloseTo(100)
		expect(spots.get('c')?.y).toBeCloseTo(50)
		expect(spots.get('c')?.isVisible).toBe(true)
		expect(spots.get('out')?.isVisible).toBe(false)
	})
})

describe('resolveOverlaps', () => {
	const boxes = (...ids: string[]) => new Map(ids.map(id => [id, BOX]))

	it('важная подпись выигрывает у перекрытой менее важной', () => {
		const items = [item('low', 1), item('high', 5)]
		const spots = new Map([
			['low', at(50, 50)],
			['high', at(55, 52)],
		])
		resolveOverlaps(items, spots, boxes('low', 'high'))
		expect(spots.get('high')?.isVisible).toBe(true)
		expect(spots.get('low')?.isVisible).toBe(false)
	})

	it('закреплённая всегда видна и забирает место у более важной', () => {
		const items = [item('pinned', 0, true), item('high', 99)]
		const spots = new Map([
			['pinned', at(50, 50)],
			['high', at(52, 50)],
		])
		resolveOverlaps(items, spots, boxes('pinned', 'high'))
		expect(spots.get('pinned')?.isVisible).toBe(true)
		expect(spots.get('high')?.isVisible).toBe(false)
	})

	it('закреплённые между собой не скрываются; вне экрана закреплённая остаётся скрытой', () => {
		const items = [item('p1', 1, true), item('p2', 2, true), item('off', 3, true)]
		const spots = new Map([
			['p1', at(50, 50)],
			['p2', at(50, 50)],
			['off', at(500, 50, false)],
		])
		resolveOverlaps(items, spots, boxes('p1', 'p2', 'off'))
		expect([spots.get('p1')?.isVisible, spots.get('p2')?.isVisible, spots.get('off')?.isVisible]).toEqual([true, true, false])
	})

	it('вне экрана не занимает место', () => {
		const items = [item('off', 9), item('on', 1)]
		const spots = new Map([
			['off', at(50, 50, false)],
			['on', at(50, 50)],
		])
		resolveOverlaps(items, spots, boxes('off', 'on'))
		expect(spots.get('on')?.isVisible).toBe(true)
	})

	it('неперекрывающиеся и касающиеся краями остаются видимыми', () => {
		const items = [item('a', 1), item('b', 2), item('c', 3)]
		const spots = new Map([
			['a', at(0, 50)],
			['b', at(20, 50)],
			['c', at(100, 10)],
		])
		resolveOverlaps(items, spots, boxes('a', 'b', 'c'))
		expect([...spots.values()].every(spot => spot.isVisible)).toBe(true)
	})

	it('подпись без измеренного размера ни с кем не пересекается', () => {
		const items = [item('a', 1), item('b', 2)]
		const spots = new Map([
			['a', at(50, 50)],
			['b', at(50, 50)],
		])
		resolveOverlaps(items, spots, new Map())
		expect([...spots.values()].every(spot => spot.isVisible)).toBe(true)
	})

	it('порядок входного списка не меняется', () => {
		const items = [item('a', 1), item('b', 2)]
		resolveOverlaps(
			items,
			new Map([
				['a', at(0, 0)],
				['b', at(0, 0)],
			]),
			new Map(),
		)
		expect(items.map(entry => entry.id)).toEqual(['a', 'b'])
	})
})
