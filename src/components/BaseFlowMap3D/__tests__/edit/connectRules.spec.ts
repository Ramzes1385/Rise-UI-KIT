import { ref } from 'vue'
import { UI_FLOW_MAP_3D } from '@/locales/messages'
import { connectVerdict } from '../../model/edit/connect/connectRules'
import type { FlowNode } from '@components/BaseFlowMap/types/data/flowData.types'

function modelOf(rules: Record<string, unknown> | undefined, nodes: FlowNode[]) {
	return {
		graph: ref({ nodes: new Map(nodes.map(node => [node.id, node])) }),
		notation: ref({ defaultEdgeKind: 'call', rules }),
		data: ref({ version: 1, nodes, edges: [] }),
	} as never
}

const api = { id: 'api', label: 'Шлюз', kind: 'service' }
const db = { id: 'db', label: 'База', kind: 'database' }
const bpmn = { id: 'task', label: 'Задача', kind: 'bpmn:task' }

describe('connectVerdict', () => {
	it('нет узла — «выберите цель», тот же узел — «нельзя с самим собой»', () => {
		const model = modelOf(undefined, [api])
		expect(connectVerdict(model, 'api', 'ghost')).toEqual({ isAllowed: false, message: UI_FLOW_MAP_3D.LINK_NO_TARGET })
		expect(connectVerdict(model, 'ghost', 'api')).toEqual({ isAllowed: false, message: UI_FLOW_MAP_3D.LINK_NO_TARGET })
		expect(connectVerdict(model, 'api', 'api')).toEqual({ isAllowed: false, message: UI_FLOW_MAP_3D.LINK_SELF })
	})

	it('без правил любая связь разрешена', () => {
		expect(connectVerdict(modelOf(undefined, [api, db]), 'api', 'db')).toEqual({ isAllowed: true })
		expect(connectVerdict(modelOf({}, [api, db]), 'api', 'db')).toEqual({ isAllowed: true })
	})

	it('таблица связей: вид из списка, подстановка «*» и вид другой нотации по основе', () => {
		const table = (from: string[], to: string[]) => ({ connections: [{ edge: 'call', from, to }] })
		expect(connectVerdict(modelOf(table(['service'], ['database']), [api, db]), 'api', 'db').isAllowed).toBe(true)
		expect(connectVerdict(modelOf(table(['*'], ['*']), [api, db]), 'db', 'api').isAllowed).toBe(true)
		expect(connectVerdict(modelOf(table(['bpmn:task'], ['database']), [bpmn, db]), 'task', 'db').isAllowed).toBe(true)
		expect(connectVerdict(modelOf(table(['task'], ['database']), [bpmn, db]), 'task', 'db').isAllowed).toBe(true)
	})

	it('связь вне таблицы отказывается с названием вида и узлов', () => {
		const model = modelOf({ connections: [{ edge: 'call', from: ['database'], to: ['database'] }] }, [api, db])
		const verdict = connectVerdict(model, 'api', 'db')
		expect(verdict.isAllowed).toBe(false)
		expect(verdict).toMatchObject({ message: expect.stringContaining('Шлюз') })
		expect(
			connectVerdict(modelOf({ connections: [{ edge: 'event', from: ['*'], to: ['*'] }] }, [api, db]), 'api', 'db').isAllowed,
		).toBe(false)
	})

	it('свой canConnect: true и ничего — можно, объект с причиной — нельзя', () => {
		expect(connectVerdict(modelOf({ canConnect: () => true }, [api, db]), 'api', 'db')).toEqual({ isAllowed: true })
		expect(connectVerdict(modelOf({ canConnect: () => undefined }, [api, db]), 'api', 'db')).toEqual({ isAllowed: true })
		expect(connectVerdict(modelOf({ canConnect: () => ({ code: 'x', message: 'Нельзя' }) }, [api, db]), 'api', 'db')).toEqual({
			isAllowed: false,
			message: 'Нельзя',
		})
	})
})
