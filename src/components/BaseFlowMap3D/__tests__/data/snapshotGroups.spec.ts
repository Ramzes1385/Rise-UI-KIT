import { computeLevels } from '../../model/data/snapshotLevels'
import { buildGroupItems } from '../../model/data/snapshotGroups'
import { fakeModel, group, rect } from '../helpers/fakeModel.test-utils'

const PLAN = { unit: 40, origin: { x: 10, z: 5 } }

describe('buildGroupItems', () => {
	it('без групп ничего не строит', () => {
		const model = fakeModel({ groups: undefined })
		expect(buildGroupItems(model, PLAN, computeLevels(model, { isLayered: false, gap: 2 }))).toEqual([])
	})

	it('переводит рамку в единицы сцены, считает вложенность и пропускает группу без рамки', () => {
		const model = fakeModel({
			groups: [
				group('top'),
				group('mid', { parent: 'top' }),
				group('leaf', { parent: 'mid', model3d: { base: 'plate' } }),
				group('lost'),
			],
			groupRects: { top: rect(40, 80, 400, 200), mid: rect(80, 100, 100, 100), leaf: rect(90, 110, 10, 10) },
		})
		const items = buildGroupItems(model, PLAN, computeLevels(model, { isLayered: false, gap: 2 }))
		expect(items.map(item => [item.id, item.depth, item.base])).toEqual([
			['top', 0, 'dashed'],
			['mid', 1, 'dashed'],
			['leaf', 2, 'plate'],
		])
		expect(items[0].rect).toEqual({ x0: 1 - 10, z0: 2 - 5, x1: 11 - 10, z1: 7 - 5 })
		expect(items[0].label).toBe('TOP')
	})

	it('в «Слоях» сдвигает рамку назад на сдвиг яруса', () => {
		const model = fakeModel({ groups: [group('a'), group('b')], groupRects: { a: rect(0, 0, 40, 40), b: rect(0, 0, 40, 40) } })
		const items = buildGroupItems(model, PLAN, computeLevels(model, { isLayered: true, gap: 2 }))
		expect(items[1].y).toBe(2)
		expect(items[1].shift).toBeCloseTo(-0.7)
		expect(items[1].rect.z0).toBeCloseTo(-5 - 0.7)
		expect(items[1].tier).toBe(1)
	})

	it('цепочка родителей длиннее предела не зацикливает расчёт глубины', () => {
		const model = fakeModel({
			groups: [group('a', { parent: 'b' }), group('b', { parent: 'a' })],
			groupRects: { a: rect(0, 0, 40, 40), b: rect(0, 0, 40, 40) },
		})
		const [first] = buildGroupItems(model, PLAN, computeLevels(model, { isLayered: false, gap: 2 }))
		expect(first.depth).toBe(16)
	})

	it('группа вне уровней встаёт на землю', () => {
		const model = fakeModel({ groups: [group('a')], groupRects: { a: rect(0, 0, 40, 40) } })
		const levels = { nodes: new Map(), groups: new Map(), top: 0, isLayered: false }
		expect(buildGroupItems(model, PLAN, levels)[0]).toMatchObject({ tier: 0, y: 0, shift: 0 })
	})
})
