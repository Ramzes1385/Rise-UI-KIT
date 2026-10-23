import { edge, group, map, node } from '../../fixtures/flowData'
import { collectFlowIds, createFlowId } from '../../../../../model/data/flowIds'

describe('flowIds', () => {
	it('collectFlowIds собирает id узлов, связей, групп и сценариев', () => {
		const data = map({
			nodes: [node('n1')],
			edges: [edge('e1', ['n1', 'n1'])],
			groups: [group('g1')],
			scenarios: [{ id: 's1', title: 'S', steps: [] } as never],
		})
		expect([...collectFlowIds(data)].sort()).toEqual(['e1', 'g1', 'n1', 's1'])
		expect(collectFlowIds(map()).size).toBe(0)
	})

	it('createFlowId даёт свободный id с префиксом', () => {
		expect(createFlowId('node', new Set())).toBe('node-1')
		expect(createFlowId('node', new Set(['a', 'b']))).toBe('node-3')
	})

	it('createFlowId пропускает занятые номера', () => {
		expect(createFlowId('node', new Set(['node-2', 'node-3']))).toBe('node-4')
		expect(createFlowId('edge', new Set(['x', 'edge-2']))).toBe('edge-3')
	})
})
