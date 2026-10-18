import { edge, group, map, node } from '../fixtures/flowData'
import { flowServices } from '../../../../model/notations/services'
import { createHookRunner } from '@composables/editor/useCommandHistory'
import type { FlowChange } from '../../../../types/data/flowReview.types'
import type { FlowHooks } from '../../../../types/api/flowController.types'
import type { FlowCommandEnv } from '../../../../types/internal/core/flowModelCore.types'
import { createConnectBefore, createCreateBefore, createDeleteBefore, createLabelBefore } from '../../../../model/commands/flowCommandHooks'

const env: FlowCommandEnv = {
	notation: () => flowServices,
	registry: () => new Map([[flowServices.id, flowServices]]),
	scope: () => ({}) as never,
	positionOf: () => undefined,
	source: 'api',
}
const data = map({ nodes: [node('a'), node('b')] })
const root: FlowChange = { type: 'root', patch: { title: 'T' }, previous: {} }

describe('before-хуки команд: нетипичные наборы изменений', () => {
	it.each([
		{ name: 'создание', make: () => createCreateBefore('node', 'api') },
		{ name: 'подпись', make: () => createLabelBefore({ entity: 'node', id: 'a' }) },
		{ name: 'связь', make: () => createConnectBefore(env) },
	])('$name: чужие изменения проходят без вызова хука', async ({ make }) => {
		const hooks = createHookRunner<FlowHooks>()
		const spy = vi.fn()
		for (const hook of ['beforeCreate', 'beforeEditLabel', 'beforeConnect'] as const) hooks.on(hook, spy)
		expect(await make()(hooks, [root], data)).toEqual([root])
		expect(await make()(hooks, [], data)).toEqual([])
		expect(spy).not.toHaveBeenCalled()
	})

	it('подпись: пустой label в изменении превращается в пустую строку, хук может отменить', async () => {
		const hooks = createHookRunner<FlowHooks>()
		const seen = vi.fn()
		const off = hooks.on('beforeEditLabel', ctx => void seen(ctx.value, ctx.previous))
		const change: FlowChange = { type: 'update', entity: 'node', id: 'a', patch: {}, previous: {} }
		expect(await createLabelBefore({ entity: 'node', id: 'a' })(hooks, [change], data)).toEqual([{ ...change, patch: { label: '' } }])
		expect(seen).toHaveBeenCalledWith('', '')
		off()
		hooks.on('beforeEditLabel', () => false)
		expect(await createLabelBefore({ entity: 'node', id: 'a' })(hooks, [change], data)).toBeNull()
	})

	it('удаление: не-remove изменения игнорируются, группы попадают в набор, отмена даёт null', async () => {
		const hooks = createHookRunner<FlowHooks>()
		const seen = vi.fn()
		hooks.on('beforeDelete', ctx => void seen(ctx.nodes.length, ctx.edges.length, ctx.groups.length))
		const full = map({ nodes: [node('a')], edges: [edge('e', ['a', 'a'])], groups: [group('g')] })
		const changes: FlowChange[] = [
			root,
			{ type: 'remove', entity: 'edge', id: 'e', value: full.edges[0], index: 0 },
			{ type: 'remove', entity: 'node', id: 'a', value: full.nodes[0], index: 0 },
			{ type: 'remove', entity: 'group', id: 'g', value: full.groups?.[0] as never, index: 0 },
			{ type: 'remove', entity: 'scenario', id: 's', value: { id: 's' } as never, index: 0 },
		]
		const result = await createDeleteBefore('api')(hooks, changes, full)
		expect(seen).toHaveBeenCalledWith(1, 1, 1)
		expect(result?.map(change => (change as { id: string }).id)).toEqual(['e', 'a', 'g'])
		hooks.on('beforeDelete', () => false, { priority: 5 })
		expect(await createDeleteBefore('api')(hooks, changes, full)).toBeNull()
	})

	it('связь: узлы не найдены — изменения проходят; вид по умолчанию берётся из нотации', async () => {
		const hooks = createHookRunner<FlowHooks>()
		const kinds: string[] = []
		hooks.on('beforeConnect', ctx => void kinds.push(ctx.kind))
		const before = createConnectBefore(env)
		const lost: FlowChange = { type: 'add', entity: 'edge', value: edge('e', ['a', 'ghost']) }
		expect(await before(hooks, [lost], data)).toEqual([lost])
		expect(await before(hooks, [{ type: 'add', entity: 'edge', value: edge('e', ['ghost', 'a']) }], data)).toHaveLength(1)
		const plain: FlowChange = { type: 'add', entity: 'edge', value: edge('e', ['a', 'b']) }
		expect(await before(hooks, [plain], data)).toEqual([plain])
		expect(kinds).toEqual(['call'])
		hooks.on('beforeConnect', () => false, { priority: 3 })
		expect(await before(hooks, [plain], data)).toBeNull()
	})
})
