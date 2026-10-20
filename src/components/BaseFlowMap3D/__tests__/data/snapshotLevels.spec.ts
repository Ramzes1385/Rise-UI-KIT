import { fakeModel, group, node } from '../helpers/fakeModel.test-utils'
import { computeLevels, levelGap } from '../../model/data/snapshotLevels'

describe('levelGap', () => {
	it('берёт положительное конечное число, иначе — 2,5', () => {
		expect(levelGap(4)).toBe(4)
		expect(levelGap(undefined)).toBe(2.5)
		expect(levelGap(0)).toBe(2.5)
		expect(levelGap(-1)).toBe(2.5)
		expect(levelGap(Number.NaN)).toBe(2.5)
		expect(levelGap(Infinity)).toBe(2.5)
	})
})

describe('computeLevels', () => {
	const layers = { isLayered: true, gap: 2 }

	it('без групп все узлы на земле и высота яруса — 0', () => {
		const levels = computeLevels(fakeModel({ nodes: [node('a')], groups: undefined }), layers)
		expect(levels.nodes.get('a')).toEqual({ tier: 0, y: 0, z: 0 })
		expect(levels.top).toBe(0)
		expect(levels.isLayered).toBe(true)
	})

	it('ярус — номер группы верхнего уровня, а `model3d.level` сильнее порядка', () => {
		const model = fakeModel({
			groups: [group('g0'), group('g1'), group('g2', { model3d: { level: 5 } })],
			nodes: [node('a', { group: 'g0' }), node('b', { group: 'g1' }), node('c', { group: 'g2' }), node('d')],
		})
		const levels = computeLevels(model, layers)
		expect(levels.nodes.get('a')?.tier).toBe(0)
		expect(levels.nodes.get('b')).toEqual({ tier: 1, y: 2, z: -0.7 })
		expect(levels.nodes.get('c')?.tier).toBe(5)
		expect(levels.nodes.get('d')).toEqual({ tier: 0, y: 0, z: 0 })
		expect(levels.groups.get('g1')?.y).toBe(2)
		expect(levels.top).toBe(10)
	})

	it('вложенная группа берёт ярус верхней, обрыв цепочки и узел с неизвестной группой не ломают расчёт', () => {
		const model = fakeModel({
			groups: [
				group('top0'),
				group('top1'),
				group('inner', { parent: 'top1' }),
				group('orphan', { parent: 'missing' }),
				group('loop-a', { parent: 'loop-b' }),
				group('loop-b', { parent: 'loop-a' }),
			],
			nodes: [node('x', { group: 'inner' }), node('y', { group: 'ghost' })],
		})
		const levels = computeLevels(model, layers)
		expect(levels.nodes.get('x')?.tier).toBe(1)
		expect(levels.nodes.get('y')).toEqual({ tier: 0, y: 0, z: 0 })
		expect(levels.groups.get('orphan')?.tier).toBe(-1)
		expect(levels.groups.has('loop-a')).toBe(true)
	})

	it('без «Слоёв» ярус остаётся номером, а высота и сдвиг — нули', () => {
		const model = fakeModel({ groups: [group('g0'), group('g1')], nodes: [node('b', { group: 'g1' })] })
		const levels = computeLevels(model, { isLayered: false, gap: 2 })
		expect(levels.nodes.get('b')).toEqual({ tier: 1, y: 0, z: 0 })
		expect(levels.isLayered).toBe(false)
		expect(levels.top).toBe(0)
	})
})
