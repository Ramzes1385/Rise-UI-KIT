import { notationWith } from '../fixtures/layoutScope'
import { group, map, node } from '../fixtures/flowData'
import { createHarness } from '../fixtures/modelHarness'
import type { FlowNotation } from '../../../../types/api/flowNotation.types'

function harnessOf(notation: FlowNotation, data = map({ notation: notation.id }), props = {}) {
	return createHarness({ ...data, notation: notation.id }, { props: { notations: [notation], ...props } })
}

const nodes = [node('t1', { kind: 'task' }), node('t2', { kind: 'task' }), node('s1', { kind: 'store' }), node('s2', { kind: 'store' })]

describe('правила связей: таблица', () => {
	const notation = notationWith({
		rules: {
			connections: [
				{ edge: 'flow', from: ['task'], to: ['task', 'store'] },
				{ edge: 'flow', from: ['*'], to: ['store'] },
				{ edge: 'rules:flow', from: ['task'], to: ['task'] },
			],
		},
	})

	it('пара видов из таблицы проходит, остальные — connection-not-allowed с подписями узлов', async () => {
		const { controller } = harnessOf(notation, map({ nodes }))
		expect((await controller.connect('t1', 't2')).isApplied).toBe(true)
		const denied = await controller.connect('s1', 't1')
		expect(denied.reject).toMatchObject({ by: 'rule', code: 'connection-not-allowed', command: 'connect' })
		expect(denied.reject?.message).toContain('s1')
	})

	it('* в списке видов подходит любому виду; вид можно писать с префиксом нотации', async () => {
		const { controller } = harnessOf(notation, map({ nodes }))
		expect((await controller.connect('s1', 's2')).isApplied).toBe(true)
		const prefixed = await controller.connect('t1', 't2', { kind: 'rules:flow' })
		expect(prefixed.isApplied).toBe(true)
	})

	it('вид узла с префиксом нотации сопоставляется по короткому имени', async () => {
		const { controller } = harnessOf(notation, map({ nodes: [node('p1', { kind: 'rules:task' }), node('p2', { kind: 'rules:task' })] }))
		expect((await controller.connect('p1', 'p2')).isApplied).toBe(true)
	})

	it('без таблицы разрешено всё', async () => {
		const { controller } = harnessOf(notationWith(), map({ nodes }))
		expect((await controller.connect('s1', 't1')).isApplied).toBe(true)
	})
})

describe('правила связей: пулы', () => {
	const pools = [group('p1', { kind: 'pool' }), group('p2', { kind: 'pool' }), group('l1', { kind: 'lane', parent: 'p1' })]
	const placed = [node('a', { group: 'l1' }), node('b', { group: 'p1' }), node('c', { group: 'p2' }), node('d')]

	it('same: только внутри одного пула, вложенные группы считаются своим пулом', async () => {
		const notation = notationWith({ rules: { connections: [{ edge: 'flow', from: ['*'], to: ['*'], pools: 'same' }] } })
		const { controller } = harnessOf(notation, map({ groups: pools, nodes: placed }))
		expect((await controller.connect('a', 'b')).isApplied).toBe(true)
		const cross = await controller.connect('a', 'c')
		expect(cross.reject).toMatchObject({ by: 'rule', code: 'pools-same' })
		expect((await controller.connect('d', 'd')).isApplied).toBe(true)
		expect((await controller.connect('a', 'd')).reject?.code).toBe('pools-same')
	})

	it('different: только между разными пулами', async () => {
		const notation = notationWith({ rules: { connections: [{ edge: 'flow', from: ['*'], to: ['*'], pools: 'different' }] } })
		const { controller } = harnessOf(notation, map({ groups: pools, nodes: placed }))
		expect((await controller.connect('a', 'c')).isApplied).toBe(true)
		expect((await controller.connect('a', 'b')).reject).toMatchObject({ by: 'rule', code: 'pools-different' })
	})
})

describe('правила связей: порты', () => {
	const notation = notationWith()
	const data = map({ nodes })

	it('порт принимает только своё направление', async () => {
		const { controller } = harnessOf(notation, data)
		const wrongOut = await controller.connect({ node: 't1' }, { node: 's1', port: 'out' })
		expect(wrongOut.reject).toMatchObject({ by: 'rule', code: 'port-direction' })
		expect(wrongOut.reject?.message).toContain('s1')
		const wrongIn = await controller.connect({ node: 's1', port: 'in' }, { node: 's2', port: 'in' })
		expect(wrongIn.reject?.code).toBe('port-direction')
		const ok = await controller.connect({ node: 's1', port: 'out' }, { node: 's2', port: 'in' })
		expect(ok.isApplied).toBe(true)
	})

	it('maxEdges: лишняя связь на занятый порт — port-full (limit), подпись порта в сообщении', async () => {
		const { controller } = harnessOf(notation, data)
		await controller.connect({ node: 't1' }, { node: 's1', port: 'in' })
		const full = await controller.connect({ node: 't2' }, { node: 's1', port: 'in' })
		expect(full.reject).toMatchObject({ by: 'limit', code: 'port-full' })
		expect(full.reject?.message).toContain('Вход')
		expect(full.reject?.message).toContain('1')
	})

	it('maxEdges учитывает чужие связи на том же порту выхода и на другом узле', async () => {
		const { controller } = harnessOf(notation, data)
		await controller.connect({ node: 's1', port: 'out' }, { node: 's2', port: 'in' })
		const second = await controller.connect({ node: 's1', port: 'out' }, { node: 't1' })
		expect(second.isApplied).toBe(true)
		const other = await controller.connect({ node: 't1' }, { node: 's1', port: 'in' })
		expect(other.isApplied).toBe(true)
	})

	it('перенос уже существующей связи не считает её саму занимающей порт', async () => {
		const { controller } = harnessOf(notation, data)
		await controller.connect({ node: 't1' }, { node: 's1', port: 'in' }, { id: 'link' })
		const moved = await controller.updateEdge('link', { targetPort: 'in', label: undefined, target: 's1' })
		expect(moved.isApplied).toBe(true)
	})

	it('порты узла главнее портов вида; неизвестный порт ловит проверка структуры, узел без портов принимает любой', async () => {
		const own = map({
			nodes: [node('x', { kind: 'task', ports: [{ id: 'only-out', direction: 'out' }] }), node('y', { kind: 'task' })],
		})
		const { controller } = harnessOf(notation, own)
		expect((await controller.connect({ node: 'y' }, { node: 'x', port: 'only-out' })).reject?.code).toBe('port-direction')
		expect((await controller.connect({ node: 'x', port: 'ghost' }, { node: 'y' })).reject?.code).toBe('issues')
		expect((await controller.connect({ node: 'y' }, { node: 'y', port: 'nothing' })).isApplied).toBe(true)
	})

	it('порт с direction both и без direction принимает связи в обе стороны', async () => {
		const both = map({
			nodes: [node('x', { kind: 'task', ports: [{ id: 'p', direction: 'both' }, { id: 'q' }] }), node('y', { kind: 'task' })],
		})
		const { controller } = harnessOf(notation, both)
		expect((await controller.connect({ node: 'x', port: 'p' }, { node: 'y' })).isApplied).toBe(true)
		expect((await controller.connect({ node: 'y' }, { node: 'x', port: 'q' })).isApplied).toBe(true)
	})
})

describe('правила связей и вложенности: свой код нотации', () => {
	it('canConnect: true пропускает, {code,message} отклоняет и видит порты и вид', async () => {
		const canConnect = vi.fn(({ source }: { source: { id: string } }): true | { code: string; message: string } =>
			source.id === 't1' ? true : { code: 'nope', message: 'Нельзя отсюда' },
		)
		const { controller } = harnessOf(notationWith({ rules: { canConnect } }), map({ nodes }))
		expect((await controller.connect('t1', 't2')).isApplied).toBe(true)
		const denied = await controller.connect('t2', 't1')
		expect(denied.reject).toEqual({ command: 'connect', by: 'rule', message: 'Нельзя отсюда', code: 'nope' })
		expect(canConnect).toHaveBeenLastCalledWith(
			expect.objectContaining({ kind: 'flow', source: expect.objectContaining({ id: 't2' }) }),
		)
	})

	it('canContain: при создании узла в группе и при переносе узла в группу', async () => {
		const canContain = vi.fn((target: { id: string } | null) =>
			target?.id === 'closed' ? ({ code: 'closed', message: 'Группа закрыта' } as const) : true,
		)
		const data = map({ groups: [group('open'), group('closed')], nodes: [node('t1', { kind: 'task' })] })
		const { controller } = harnessOf(notationWith({ rules: { canContain } }), data)
		const denied = await controller.addNode(node('n', { kind: 'task', group: 'closed' }))
		expect(denied.reject).toMatchObject({ by: 'rule', code: 'closed', message: 'Группа закрыта', command: 'contain' })
		expect((await controller.addNode(node('n', { kind: 'task', group: 'open' }))).isApplied).toBe(true)
		expect((await controller.addNode(node('root', { kind: 'task' }))).isApplied).toBe(true)
		expect(canContain).toHaveBeenCalledWith(null, expect.objectContaining({ id: 'root' }))
		expect((await controller.updateNode('t1', { group: 'closed' })).reject?.code).toBe('closed')
		expect((await controller.updateNode('t1', { group: 'open' })).isApplied).toBe(true)
		const unknownGroup = await controller.addNode(node('ghosted', { kind: 'task', group: 'absent' }))
		expect(unknownGroup.reject?.code).toBe('issues')
		expect(canContain).toHaveBeenCalledWith(null, expect.objectContaining({ id: 'ghosted' }))
	})
})
