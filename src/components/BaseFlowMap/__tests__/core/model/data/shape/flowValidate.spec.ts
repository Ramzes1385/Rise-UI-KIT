import { edge, group, map, node } from '../../fixtures/flowData'
import { validateFlowData } from '../../../../../model/data/flowValidate'
import type { FlowDataIssue, FlowNotation } from '../../../../../types/api/flowNotation.types'

const kind = { label: () => 'K', render: 'html', shape: { shape: 'rect' }, size: { width: 10, height: 10 } } as const

function notationOf(extra: Partial<FlowNotation> = {}): FlowNotation {
	return {
		id: 'n',
		label: () => 'N',
		nodeKinds: { service: { ...kind, ports: [{ id: 'in' }, { id: 'out' }] }, free: kind },
		edgeKinds: {},
		defaultNodeKind: 'service',
		defaultEdgeKind: 'x',
		...extra,
	}
}

function codes(issues: FlowDataIssue[]): string[] {
	return issues.map(item => item.code)
}

describe('validateFlowData', () => {
	it('корректные данные — без замечаний', () => {
		const data = map({
			nodes: [node('a'), node('b')],
			edges: [edge('e', ['a', 'b'])],
			groups: [group('g'), group('h', { parent: 'g' })],
		})
		expect(validateFlowData(data)).toEqual([])
	})

	it('повторы id в узлах, связях, группах и сценариях — по замечанию на лишний повтор', () => {
		const data = map({
			nodes: [node('a'), node('a'), node('a')],
			edges: [edge('e', ['a', 'a']), edge('e', ['a', 'a'])],
			groups: [group('g'), group('g')],
			scenarios: [{ id: 's' } as never, { id: 's' } as never],
		})
		const issues = validateFlowData(data)
		expect(codes(issues)).toEqual(['duplicate-id', 'duplicate-id', 'duplicate-id', 'duplicate-id', 'duplicate-id'])
		expect(issues.map(item => item.target)).toEqual([
			{ entity: 'node', id: 'a' },
			{ entity: 'node', id: 'a' },
			{ entity: 'edge', id: 'e' },
			{ entity: 'group', id: 'g' },
			{ entity: 'scenario', id: 's' },
		])
		expect(issues.every(item => item.level === 'error')).toBe(true)
	})

	it('висячие ссылки связей — отдельное замечание на каждый конец', () => {
		const issues = validateFlowData(map({ nodes: [node('a')], edges: [edge('e1', ['a', 'x']), edge('e2', ['y', 'z'])] }))
		expect(codes(issues)).toEqual(['missing-node', 'missing-node', 'missing-node'])
		expect(issues[0]).toMatchObject({ target: { entity: 'edge', id: 'e1' } })
		expect(issues[0].message).toContain('x')
	})

	it('порт связи проверяется по узлу, а если у узла нет портов — по виду нотации', () => {
		const notation = notationOf()
		const data = map({
			nodes: [node('a'), node('b', { ports: [{ id: 'custom' }] }), node('c', { kind: 'free' })],
			edges: [
				edge('ok', ['a', 'b'], { sourcePort: 'out', targetPort: 'custom' }),
				edge('bad-src', ['a', 'b'], { sourcePort: 'nope', targetPort: 'custom' }),
				edge('bad-dst', ['a', 'b'], { sourcePort: 'out', targetPort: 'in' }),
				edge('free', ['c', 'c'], { sourcePort: 'anything', targetPort: 'anything' }),
			],
		})
		const issues = validateFlowData(data, notation, new Map([[notation.id, notation]]))
		expect(issues.map(item => [item.code, item.target?.id])).toEqual([
			['missing-port', 'bad-src'],
			['missing-port', 'bad-dst'],
		])
		expect(issues[0].message).toContain('nope')
	})

	it('без нотации порты не проверяются', () => {
		const data = map({ nodes: [node('a')], edges: [edge('e', ['a', 'a'], { sourcePort: 'x' })] })
		expect(validateFlowData(data)).toEqual([])
	})

	it('родитель-группа и группа узла должны существовать', () => {
		const data = map({ groups: [group('g', { parent: 'nope' })], nodes: [node('a', { group: 'ghost' }), node('b', { group: 'g' })] })
		const issues = validateFlowData(data)
		expect(issues.map(item => [item.code, item.target])).toEqual([
			['missing-group', { entity: 'group', id: 'g' }],
			['missing-group', { entity: 'node', id: 'a' }],
		])
	})

	it('цикл групп находится у каждой группы цикла; самоссылка тоже цикл', () => {
		const data = map({
			groups: [
				group('a', { parent: 'b' }),
				group('b', { parent: 'c' }),
				group('c', { parent: 'a' }),
				group('self', { parent: 'self' }),
				group('tail', { parent: 'a' }),
			],
		})
		const issues = validateFlowData(data)
		expect(issues.every(item => item.code === 'group-cycle')).toBe(true)
		expect(issues.map(item => item.target?.id).sort()).toEqual(['a', 'b', 'c', 'self', 'tail'])
	})

	it('цепочка групп без цикла не даёт замечаний', () => {
		const data = map({ groups: [group('a'), group('b', { parent: 'a' }), group('c', { parent: 'b' })] })
		expect(validateFlowData(data)).toEqual([])
	})

	it('правила нотации добавляются к проверке структуры и получают данные и граф', () => {
		const custom: FlowDataIssue = { level: 'warning', code: 'custom', message: 'm' }
		const validate = vi.fn(() => [custom])
		const notation = notationOf({ rules: { validate } })
		const data = map({ nodes: [node('a')], edges: [edge('e', ['a', 'gone'])] })
		const issues = validateFlowData(data, notation)
		expect(codes(issues)).toEqual(['missing-node', 'custom'])
		expect(validate).toHaveBeenCalledWith(data, expect.objectContaining({ nodes: expect.any(Map) }))
	})

	it('нотация без правил проверки ничего не добавляет', () => {
		expect(validateFlowData(map(), notationOf({ rules: {} }))).toEqual([])
	})
})
