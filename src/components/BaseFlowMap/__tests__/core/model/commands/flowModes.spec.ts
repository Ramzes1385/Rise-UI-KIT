import { nextTick } from 'vue'
import { edge, map, node } from '../fixtures/flowData'
import { createHarness } from '../fixtures/modelHarness'
import type { FlowMapData } from '../../../../types/data/flowData.types'
import type { FlowChangeEvent } from '../../../../types/api/flowController.types'

const base = map({ nodes: [node('a'), node('b')], edges: [edge('e', ['a', 'b'], { kind: 'call' })] })
const user = { name: 'Роман' }

describe('режим review: правки уходят в черновик', () => {
	it('команда не меняет данные, а копится в черновике; id и автор — как в предложении', async () => {
		const { controller, model, eventsOf } = createHarness(base, { props: { mode: 'review', currentUser: user } })
		const first = await controller.addNode(node('c'))
		expect(first.isApplied).toBe(false)
		expect(first.changes).toHaveLength(1)
		expect(controller.getData().nodes).toHaveLength(2)
		expect(eventsOf('change')).toEqual([])
		const second = await controller.updateNode('a', { label: 'Новое' })
		expect(second.isApplied).toBe(false)
		const draft = model.draft.value
		expect(draft?.changes).toHaveLength(2)
		expect(draft?.author).toEqual(user)
		expect(draft?.status).toBe('open')
		expect(draft?.id).toMatch(/^draft-/)
		expect(draft?.label).toContain('c')
	})

	it('без пользователя автор черновика пуст', async () => {
		const { controller, model } = createHarness(base, { props: { mode: 'review' } })
		await controller.addNode(node('c'))
		expect(model.draft.value?.author).toEqual({ name: '' })
	})

	it('suggest превращает черновик в предложение и сбрасывает его; без пользователя или без изменений — null', async () => {
		const { controller, model, eventsOf } = createHarness(base, { props: { mode: 'review', currentUser: user } })
		await controller.addNode(node('c'))
		const changes = model.draft.value?.changes ?? []
		const suggestion = controller.suggest(changes, 'Добавить c')
		expect(suggestion).toMatchObject({ id: 's-1', author: user, label: 'Добавить c', status: 'open', changes })
		expect(model.draft.value).toBeNull()
		expect(eventsOf('update:suggestions')).toHaveLength(1)
		expect(controller.suggest([])).toBeNull()
		expect(controller.suggest(changes)?.label).toBeTruthy()
		expect(controller.suggest(changes)?.id).toBe('s-3')
		const anonymous = createHarness(base)
		expect(anonymous.controller.suggest(changes)).toBeNull()
	})

	it('accept применяет предложение (источник review), помечает принятым и шлёт accept', async () => {
		const suggestions = [
			{
				id: 'p1',
				author: user,
				date: 1,
				label: 'Добавить c',
				status: 'open' as const,
				changes: [{ type: 'add' as const, entity: 'node' as const, value: node('c') }],
			},
		]
		const { controller, eventsOf } = createHarness(base, { props: { mode: 'review', currentUser: user, suggestions } })
		const result = await controller.accept('p1')
		expect(result.isApplied).toBe(true)
		expect(controller.getData().nodes.map(item => item.id)).toEqual(['a', 'b', 'c'])
		expect((eventsOf('change')[0] as FlowChangeEvent).source).toBe('review')
		expect(eventsOf('accept')[0]).toMatchObject({ id: 'p1', status: 'accepted' })
		expect((await controller.accept('p1')).isApplied).toBe(false)
		expect((await controller.accept('unknown')).changes).toEqual([])
	})

	it('beforeAccept может отменить и подменить предложение', async () => {
		const change = { type: 'add' as const, entity: 'node' as const, value: node('c') }
		const suggestions = [{ id: 'p1', author: user, date: 1, status: 'open' as const, changes: [change] }]
		const { controller, eventsOf } = createHarness(base, { props: { currentUser: user, suggestions } })
		const off = controller.on('beforeAccept', () => false)
		const rejected = await controller.accept('p1')
		expect(rejected.reject).toMatchObject({ by: 'hook', code: 'beforeAccept' })
		off()
		controller.on('beforeAccept', ctx => ({ ...ctx.suggestion, changes: [{ type: 'add', entity: 'node', value: node('d') }] }))
		await controller.accept('p1')
		expect(controller.getData().nodes.map(item => item.id)).toEqual(['a', 'b', 'd'])
		expect(eventsOf('accept')).toHaveLength(1)
	})

	it('предложение, которое не применилось, остаётся открытым', async () => {
		const bad = { type: 'add' as const, entity: 'node' as const, value: node('a') }
		const suggestions = [{ id: 'p1', author: user, date: 1, status: 'open' as const, changes: [bad] }]
		const { controller, eventsOf } = createHarness(base, { props: { currentUser: user, suggestions } })
		const result = await controller.accept('p1')
		expect(result.isApplied).toBe(false)
		expect(eventsOf('accept')).toEqual([])
	})

	it('decline помечает предложение и шлёт decline; неизвестный id игнорируется', () => {
		const suggestions = [{ id: 'p1', author: user, date: 1, status: 'open' as const, changes: [] }]
		const { controller, eventsOf } = createHarness(base, { props: { suggestions } })
		controller.decline('p1')
		controller.decline('none')
		expect(eventsOf('decline')).toEqual([expect.objectContaining({ id: 'p1', status: 'declined' })])
	})

	it('сменившиеся пропсы suggestions обновляют список', async () => {
		const { controller, props } = createHarness(base, { props: { currentUser: user, suggestions: [] } })
		props.suggestions = [
			{ id: 'z', author: user, date: 1, status: 'open', changes: [{ type: 'add', entity: 'node', value: node('c') }] },
		]
		await nextTick()
		expect((await controller.accept('z')).isApplied).toBe(true)
		props.suggestions = undefined
		await nextTick()
		expect((await controller.accept('z')).changes).toEqual([])
	})

	it('compare: разница между версиями и текущими данными', () => {
		const versions = [
			{ id: 'v1', label: 'Первая', date: 1, data: map({ nodes: [node('a')] }) },
			{ id: 'v2', label: 'Вторая', date: 2, data: map({ nodes: [node('a'), node('b')] }) },
		]
		const { controller } = createHarness(base, { props: { versions } as never })
		expect(controller.compare(null)).toEqual([])
		expect(controller.compare('v1', 'v2')).toEqual([{ type: 'add', entity: 'node', value: node('b'), index: 1 }])
		expect(controller.compare('v1').some(change => change.type === 'add')).toBe(true)
		expect(controller.compare('nope')).toEqual([])
		expect(controller.compare('v1', 'nope')).toEqual([])
	})
})

describe('applyRemote и importJson', () => {
	it('applyRemote меняет данные, шлёт change с source remote и не пишет историю', () => {
		const { controller, eventsOf, model } = createHarness(base)
		controller.applyRemote([{ type: 'add', entity: 'node', value: node('r') }])
		expect(controller.getData().nodes.map(item => item.id)).toEqual(['a', 'b', 'r'])
		expect(eventsOf('change')[0]).toMatchObject({ source: 'remote', command: 'remote' })
		expect(eventsOf('update:data')).toHaveLength(1)
		expect(model.history.state.value.canUndo).toBe(false)
	})

	it('importJson принимает строку и объект, применяет разницу одним шагом и озвучивает issues', async () => {
		const { controller, model } = createHarness(base)
		const json = JSON.stringify(map({ nodes: [node('a'), node('b'), node('n')], edges: base.edges }))
		const result = await controller.importJson(json)
		expect(result.isApplied).toBe(true)
		expect(result.issues).toEqual([])
		expect(controller.getData().nodes).toHaveLength(3)
		expect(model.history.list()).toHaveLength(1)
		controller.undo()
		expect(controller.getData().nodes).toHaveLength(2)
		const second = await controller.importJson(map({ title: 'Объект', nodes: base.nodes, edges: base.edges }))
		expect(second.isApplied).toBe(true)
		expect(controller.getData().title).toBe('Объект')
	})

	it('importJson: не JSON, будущая версия и ошибки структуры — отказ с issues и событием error', async () => {
		const { controller, eventsOf } = createHarness(base)
		const broken = await controller.importJson('{нет')
		expect(broken.isApplied).toBe(false)
		expect(broken.issues[0]).toMatchObject({ level: 'error', code: 'invalid-data' })
		const future = await controller.importJson({ version: 99, nodes: [], edges: [] })
		expect(future.issues.map(item => item.code)).toContain('version-unsupported')
		const dangling = await controller.importJson(map({ nodes: [node('a')], edges: [edge('e', ['a', 'ghost'])] }))
		expect(dangling.issues.map(item => item.code)).toContain('missing-node')
		expect(eventsOf('error').map(item => (item as { code: string }).code)).toEqual([
			'invalid-data',
			'version-unsupported',
			'missing-node',
		])
		expect(controller.getData()).toBe(controller.getData())
		expect(controller.getData().nodes).toHaveLength(2)
	})

	it('importJson с замечаниями-предупреждениями применяется и возвращает их', async () => {
		const { controller } = createHarness(base)
		const result = await controller.importJson({ nodes: [node('x')], edges: [] } as unknown as FlowMapData)
		expect(result.isApplied).toBe(true)
		expect(result.issues.map(item => item.code)).toContain('version-missing')
	})

	it('beforeImport может отменить импорт и подменить данные', async () => {
		const { controller } = createHarness(base)
		const off = controller.on('beforeImport', () => false)
		const rejected = await controller.importJson(map({ nodes: [node('z')] }))
		expect(rejected.reject).toMatchObject({ by: 'hook', code: 'beforeImport' })
		expect(rejected.issues).toEqual([])
		expect(controller.getData().nodes).toHaveLength(2)
		off()
		controller.on('beforeImport', ctx => ({ ...ctx.data, title: 'Подмена' }))
		await controller.importJson(map({ nodes: [node('z')] }))
		expect(controller.getData().title).toBe('Подмена')
		expect(controller.getData().nodes.map(item => item.id)).toEqual(['z'])
	})

	it('importJson берёт нотацию из импортируемых данных', async () => {
		const { controller } = createHarness(base)
		const result = await controller.importJson({ version: 1, notation: 'services', nodes: [node('s', { kind: 'service' })], edges: [] })
		expect(result.isApplied).toBe(true)
	})

	it('transact собирает изменения нескольких команд в один шаг истории', async () => {
		const { controller, model } = createHarness(base)
		const result = await controller.transact('Пакет', async () => {
			await controller.addNode(node('c'))
			await controller.updateNode('a', { label: 'Новая' })
		})
		expect(result.isApplied).toBe(true)
		expect(result.changes).toHaveLength(2)
		expect(model.history.list().map(item => item.label)).toEqual(['Пакет'])
		controller.undo()
		expect(controller.getData().nodes).toHaveLength(2)
		const empty = await controller.transact('Пусто', () => undefined)
		expect(empty).toEqual({ isApplied: false, changes: [] })
	})

	it('transact отписывается от change даже при ошибке', async () => {
		const { controller, eventsOf } = createHarness(base)
		await expect(
			controller.transact('Сбой', () => {
				throw new Error('x')
			}),
		).rejects.toThrow('x')
		await controller.addNode(node('after'))
		expect(eventsOf('change')).toHaveLength(1)
	})
})
