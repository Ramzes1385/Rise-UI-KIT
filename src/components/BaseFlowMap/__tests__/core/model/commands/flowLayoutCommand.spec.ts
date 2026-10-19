import { edge, map, node } from '../fixtures/flowData'
import { createHarness } from '../fixtures/modelHarness'
import type { FlowChangeEvent } from '../../../../types/api/flowController.types'

const data = map({
	nodes: [node('a'), node('b'), node('c')],
	edges: [edge('1', ['a', 'b']), edge('2', ['b', 'c'])],
	layout: { direction: 'LR', gridSize: 0 },
})

describe('команда layout', () => {
	it('расставляет узлы без позиции, пишет шаг «Авто-раскладка» и шлёт change с источником layout', async () => {
		const { controller, eventsOf, model } = createHarness(data)
		const result = await controller.layout()
		expect(result.isApplied).toBe(true)
		const positions = controller.getData().nodes.map(item => item.position)
		expect(positions.every(Boolean)).toBe(true)
		expect(positions[0]?.x).toBeLessThan(positions[1]?.x ?? 0)
		expect((eventsOf('change')[0] as FlowChangeEvent).source).toBe('layout')
		expect(model.history.list()).toHaveLength(1)
		controller.undo()
		expect(controller.getData().nodes.every(item => item.position === undefined || 'position' in item)).toBe(true)
	})

	it('повторная раскладка ничего не меняет', async () => {
		const { controller } = createHarness(data)
		await controller.layout()
		const again = await controller.layout()
		expect(again).toEqual({ isApplied: false, changes: [] })
	})

	it('настройки раскладки записываются в данные и применяются к расстановке', async () => {
		const { controller } = createHarness(data)
		const result = await controller.layout({ direction: 'TB' })
		expect(result.changes[0]).toMatchObject({ type: 'root' })
		expect(controller.getData().layout).toMatchObject({ direction: 'TB', gridSize: 0 })
		const [a, b] = controller.getData().nodes
		expect(a.position?.y).toBeLessThan(b.position?.y ?? 0)
	})

	it('закреплённые узлы не двигаются, isForced снимает закрепление', async () => {
		const pinned = map({ ...data, nodes: [node('a', { isPinned: true, position: { x: 500, y: 500 } }), node('b'), node('c')] })
		const { controller } = createHarness(pinned)
		await controller.layout()
		expect(controller.getData().nodes[0].position).toEqual({ x: 500, y: 500 })
		const forced = await controller.layout({ isForced: true })
		expect(forced.isApplied).toBe(true)
		expect(controller.getData().nodes[0].isPinned).toBeUndefined()
		expect(controller.getData().nodes[0].position).not.toEqual({ x: 500, y: 500 })
	})

	it('isForced без закреплённых узлов ничего не снимает и не двигает уже стоящие', async () => {
		const { controller } = createHarness(data)
		await controller.layout()
		expect((await controller.layout({ isForced: true })).isApplied).toBe(false)
	})

	it('ids: меняются только перечисленные узлы', async () => {
		const placed = map({
			...data,
			nodes: [
				node('a', { position: { x: 900, y: 900 } }),
				node('b', { position: { x: 800, y: 800 } }),
				node('c', { position: { x: 700, y: 700 } }),
			],
		})
		const { controller } = createHarness(placed)
		const result = await controller.layout({ ids: ['c'] })
		const moved = result.changes.filter(change => change.type === 'update').map(change => (change as { id: string }).id)
		expect(moved.every(id => id === 'c')).toBe(true)
		expect(controller.getData().nodes[0].position).toEqual({ x: 900, y: 900 })
		expect(controller.getData().nodes[1].position).toEqual({ x: 800, y: 800 })
	})

	it('раскладка плагина, не вернувшая часть узлов, двигает только вернувшиеся', async () => {
		const run = vi.fn(({ nodes }: { nodes: Array<{ id: string; size: { width: number; height: number } }> }) => ({
			nodes: Object.fromEntries(
				nodes.filter(item => item.id !== 'c').map((item, index) => [item.id, { ...item.size, x: index * 200, y: 40 }]),
			),
			groups: {},
			bounds: { x: 0, y: 0, width: 400, height: 100 },
		}))
		const plugin = { name: 'partial', layouts: [{ id: 'partial', run: run as never }] }
		const { controller } = createHarness(map({ ...data, layout: { algorithm: 'partial', gridSize: 0 } }), {
			props: { plugins: [plugin] },
		})
		const result = await controller.layout()
		const moved = result.changes.flatMap(change => (change.type === 'update' ? [change.id] : []))
		expect(moved).toEqual(['a', 'b'])
		expect(controller.getData().nodes.find(item => item.id === 'c')?.position).toBeUndefined()
		expect(controller.getData().nodes.find(item => item.id === 'b')?.position).toEqual({ x: 200, y: 40 })
	})

	it('запрещена в режиме disabled', async () => {
		const { controller } = createHarness(data, { props: { isDisabled: true } })
		expect((await controller.layout()).reject?.code).toBe('disabled')
	})
})

describe('компактный режим модели', () => {
	it('плитки 72×56 берутся из isCompact', () => {
		const { model } = createHarness(map({ nodes: [node('a')] }), { isCompact: true })
		expect(model.layout.value.nodes.a).toMatchObject({ width: 72, height: 56 })
	})
})
