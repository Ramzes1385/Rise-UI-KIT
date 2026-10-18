import type { FlowNotation } from '../../../../types/api/flowNotation.types'
import { BASE_GROUP_KINDS, FALLBACK_EDGE_KIND, FALLBACK_GROUP_KIND, FALLBACK_NODE_KIND } from '../../../../model/notations/base'
import { createNotationRegistry, createRegistry, defineFlowNotation, defineFlowPlugin } from '../../../../model/notations/registry'
import {
	applyNotationStyle,
	parseKindRef,
	resolveEdgeKind,
	resolveGroupKind,
	resolveNodeKind,
	findNodeKind,
} from '../../../../model/notations/resolveKind'

const box = { label: () => 'K', render: 'html', shape: { shape: 'rect' }, size: { width: 1, height: 1 } } as const

function notation(id: string, extra: Partial<FlowNotation> = {}): FlowNotation {
	return {
		id,
		label: () => id,
		nodeKinds: { [`${id}-node`]: box },
		edgeKinds: { [`${id}-edge`]: { label: () => 'E', stroke: 'solid' } },
		defaultNodeKind: `${id}-node`,
		defaultEdgeKind: `${id}-edge`,
		...extra,
	}
}

let warn: ReturnType<typeof vi.spyOn>

beforeEach(() => {
	warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
})

afterEach(() => {
	warn.mockRestore()
})

describe('registry', () => {
	it('defineFlowNotation и defineFlowPlugin возвращают то, что получили', () => {
		const value = notation('a')
		expect(defineFlowNotation(value)).toBe(value)
		const plugin = { id: 'p' } as never
		expect(defineFlowPlugin(plugin)).toBe(plugin)
	})

	it('createRegistry индексирует по id и предупреждает о повторе, последний побеждает', () => {
		const first = { id: 'x', value: 1 }
		const second = { id: 'x', value: 2 }
		const registry = createRegistry([first, { id: 'y', value: 3 }, second], () => 'вид')
		expect(registry.get('x')).toBe(second)
		expect(registry.size).toBe(2)
		expect(warn).toHaveBeenCalledTimes(1)
		expect(warn.mock.calls[0][0]).toContain('x')
	})

	it('createNotationRegistry: базовая нотация первая, дополнительные поверх, повтор id — предупреждение', () => {
		const base = notation('base')
		const extra = notation('extra')
		const registry = createNotationRegistry(base, [extra])
		expect([...registry.keys()]).toEqual(['base', 'extra'])
		expect(warn).not.toHaveBeenCalled()
		const replacement = notation('extra')
		const again = createNotationRegistry(base, [extra, replacement])
		expect(again.get('extra')).toBe(replacement)
		expect(warn).toHaveBeenCalledTimes(1)
		createNotationRegistry(base, [notation('base')])
		expect(warn).toHaveBeenCalledTimes(2)
	})
})

describe('resolveKind', () => {
	const own = notation('own', { groupKinds: { custom: { label: () => 'C', layout: 'tier' } } })
	const other = notation('other')
	const registry = new Map([
		[own.id, own],
		[other.id, other],
	])

	it('parseKindRef делит «нотация:вид» по первому двоеточию', () => {
		expect(parseKindRef('task')).toEqual({ notation: null, kind: 'task' })
		expect(parseKindRef('bpmn:task')).toEqual({ notation: 'bpmn', kind: 'task' })
		expect(parseKindRef('a:b:c')).toEqual({ notation: 'a', kind: 'b:c' })
	})

	it('вид без префикса берётся из своей нотации, с префиксом — из реестра', () => {
		expect(findNodeKind('own-node', own, registry)).toBe(own.nodeKinds['own-node'])
		expect(findNodeKind('other:other-node', own, registry)).toBe(other.nodeKinds['other-node'])
		expect(findNodeKind('own-node', own, registry)).toBeDefined()
		expect(findNodeKind('nothing', own, registry)).toBeUndefined()
	})

	it('неизвестная нотация в префиксе — ищем в своей', () => {
		expect(findNodeKind('ghost:own-node', own, registry)).toBe(own.nodeKinds['own-node'])
	})

	it('resolveNodeKind: найденный вид без предупреждения, неизвестный — запасной и одно предупреждение на вид', () => {
		expect(resolveNodeKind('own-node', own, registry)).toBe(own.nodeKinds['own-node'])
		expect(warn).not.toHaveBeenCalled()
		expect(resolveNodeKind('mystery-a', own, registry)).toBe(FALLBACK_NODE_KIND)
		expect(resolveNodeKind('mystery-a', own, registry)).toBe(FALLBACK_NODE_KIND)
		expect(warn).toHaveBeenCalledTimes(1)
		expect(warn.mock.calls[0][0]).toContain('mystery-a')
		resolveNodeKind('mystery-b', own, registry)
		expect(warn).toHaveBeenCalledTimes(2)
	})

	it('resolveEdgeKind: без вида — вид по умолчанию нотации; неизвестный — запасной', () => {
		expect(resolveEdgeKind(undefined, own, registry)).toBe(own.edgeKinds['own-edge'])
		expect(resolveEdgeKind('other:other-edge', own, registry)).toBe(other.edgeKinds['other-edge'])
		expect(resolveEdgeKind('mystery-edge', own, registry)).toBe(FALLBACK_EDGE_KIND)
		expect(warn).toHaveBeenCalledTimes(1)
	})

	it('resolveGroupKind: нотация, затем базовые виды, затем запасной с предупреждением', () => {
		expect(resolveGroupKind('custom', own, registry)).toBe(own.groupKinds?.custom)
		expect(resolveGroupKind('lane', own, registry)).toBe(BASE_GROUP_KINDS.lane)
		expect(resolveGroupKind('other:zone', own, registry)).toBe(BASE_GROUP_KINDS.zone)
		expect(warn).not.toHaveBeenCalled()
		expect(resolveGroupKind('strange-group', own, registry)).toBe(FALLBACK_GROUP_KIND)
		expect(warn).toHaveBeenCalledTimes(1)
	})
})

describe('base', () => {
	it('базовые виды групп: полосы у lane и pool, ярус у layer, рамки у остальных', () => {
		expect(BASE_GROUP_KINDS.lane).toMatchObject({ layout: 'band', header: 'start' })
		expect(BASE_GROUP_KINDS.pool).toMatchObject({ layout: 'band', header: 'start' })
		expect(BASE_GROUP_KINDS.layer.layout).toBe('tier')
		expect(BASE_GROUP_KINDS.boundary).toMatchObject({ layout: 'box', border: 'dashed' })
		expect(BASE_GROUP_KINDS.context.border).toBe('dashed')
		expect(BASE_GROUP_KINDS.zone.border).toBe('solid')
	})

	it('запасные виды ничего не рисуют текстом', () => {
		expect(FALLBACK_NODE_KIND.label()).toBe('')
		expect(FALLBACK_EDGE_KIND.label()).toBe('')
		expect(FALLBACK_GROUP_KIND.label()).toBe('')
	})
})

describe('applyNotationStyle', () => {
	const styled = notation('styled', {
		styles: { alt: { label: () => 'Alt', nodeKinds: { 'styled-node': { size: { width: 7, height: 8 } } } } },
	})

	it('накладывает переопределения вида; неизвестный стиль и не строка оставляют нотацию', () => {
		const result = applyNotationStyle(styled, 'alt')
		expect(result.nodeKinds['styled-node'].size).toEqual({ width: 7, height: 8 })
		expect(result.nodeKinds['styled-node'].label).toBe(styled.nodeKinds['styled-node'].label)
		expect(applyNotationStyle(styled, 'none')).toBe(styled)
		expect(applyNotationStyle(styled, 5)).toBe(styled)
	})
})
