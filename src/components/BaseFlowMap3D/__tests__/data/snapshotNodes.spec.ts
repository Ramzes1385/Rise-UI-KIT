import { computeLevels } from '../../model/data/snapshotLevels'
import { fakeModel, group, node, rect } from '../helpers/fakeModel.test-utils'
import { buildNodeItems, MODEL_HEIGHT, medianCell, quarterOf } from '../../model/data/snapshotNodes'

const PLAN = { unit: 40, origin: { x: 10, z: 5 } }

describe('quarterOf', () => {
	it('округляет поворот до четверти оборота в пределах 0–270', () => {
		expect(quarterOf(undefined)).toBe(0)
		expect(quarterOf(Number.NaN)).toBe(0)
		expect(quarterOf(44)).toBe(0)
		expect(quarterOf(46)).toBe(90)
		expect(quarterOf(180)).toBe(180)
		expect(quarterOf(360)).toBe(0)
		expect(quarterOf(-90)).toBe(270)
	})
})

describe('medianCell', () => {
	it('берёт медианную меньшую сторону рамок с коэффициентом 0,8', () => {
		const rects = [rect(0, 0, 160, 40), rect(0, 0, 80, 80), rect(0, 0, 200, 120)]
		expect(medianCell(rects, 40)).toBeCloseTo((80 / 40) * 0.8)
	})

	it('без рамок опирается на единицу плана', () => {
		expect(medianCell([], 40)).toBeCloseTo(0.8)
	})
})

describe('buildNodeItems', () => {
	function itemsOf(parts: Parameters<typeof fakeModel>[0], isLayered = false) {
		const model = fakeModel(parts)
		return buildNodeItems(model, PLAN, computeLevels(model, { isLayered, gap: 2 }))
	}

	it('переводит рамку в центр сцены и считает высоту, поворот и подъём', () => {
		const [item] = itemsOf({
			nodes: [node('a', { model3d: { rotation: 90, scale: 2, elevation: 1.5 } })],
			rects: { a: rect(400, 200, 160, 56) },
		})
		expect(item.x).toBeCloseTo((400 + 80) / 40 - 10)
		expect(item.z).toBeCloseTo((200 + 28) / 40 - 5)
		expect(item.rotation).toBeCloseTo(Math.PI / 2)
		expect(item.scale).toBe(2)
		expect(item.height).toBeCloseTo(MODEL_HEIGHT * 2)
		expect(item.elevation).toBe(1.5)
		expect(item.selection.node).toMatchObject({ id: 'a', title: 'A', kind: 'service', tone: 'none' })
		expect(item.selection.kindModel).toBe('auto')
	})

	it('масштаб без значения или не больше нуля заменяется единицей', () => {
		const items = itemsOf({
			nodes: [node('a', { model3d: { scale: -3 } }), node('b')],
			rects: { a: rect(0, 0), b: rect(0, 0) },
		})
		expect(items.map(item => item.scale)).toEqual([1, 1])
	})

	it('пропускает узлы без рамки в раскладке', () => {
		const items = itemsOf({ nodes: [node('a'), node('b')], rects: { b: rect(0, 0) } })
		expect(items.map(item => item.id)).toEqual(['b'])
	})

	it('ставит ярус и сдвиг назад в «Слоях», а своя модель узла попадает в выбор', () => {
		const [item] = itemsOf(
			{
				groups: [group('g0'), group('g1')],
				nodes: [node('a', { group: 'g1', model3d: { model: 'db', url: 'x.glb' }, isExternal: true })],
				rects: { a: rect(0, 0) },
			},
			true,
		)
		expect(item.base).toBe(2)
		expect(item.shift).toBeCloseTo(-0.7)
		expect(item.selection.model3d).toEqual({ model: 'db', url: 'x.glb' })
		expect(item.selection.isExternal).toBe(true)
	})

	it('форма вида нотации превращается в форму модели, неизвестная — в скруглённую', () => {
		const shapeOf = (shape: string) =>
			itemsOf({ nodes: [node('a')], rects: { a: rect(0, 0) }, shape: shape as never })[0].selection.node.source
		expect(shapeOf('diamond')).toMatchObject({ shape: 'diamond' })
		expect(shapeOf('pill')).toMatchObject({ shape: 'rounded' })
		expect(shapeOf('unknown-shape')).toMatchObject({ shape: 'rounded' })
	})
})
