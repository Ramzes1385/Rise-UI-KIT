import { formatMessage } from '@/locales/state'
import { UI_FLOW_DFD } from '@/locales/messages'
import { flowDfd } from '../../model/notations/dfd'
import { dfdRules } from '../../model/notations/dfd/dfdRules'
import { allLabels, markersOf } from '../fixtures/kindHelpers'
import { edge, graphOf, mapData, node } from '../fixtures/idefData'
import type { FlowEdge, FlowNode } from '../../types/data/flowData.types'
import { dfdEdgeKinds, dfdNodeKinds, dfdStyles } from '../../model/notations/dfd/dfdKinds'

const process = (id: string, extra: Partial<FlowNode> = {}): FlowNode => node(id, 'process', extra)
const store = (id: string): FlowNode => node(id, 'store')
const entity = (id: string): FlowNode => node(id, 'entity')

function connect(source: FlowNode, target: FlowNode) {
	const data = mapData([source, target], [])
	return dfdRules.canConnect!({ source, target, kind: 'flow', data, graph: graphOf(data.nodes, data.edges) })
}

function validate(nodes: FlowNode[], edges: FlowEdge[]) {
	return dfdRules.validate!(mapData(nodes, edges), graphOf(nodes, edges))
}

describe('DFD: нотация', () => {
	it('собирает определение с двумя стилями и стилем по умолчанию Гейна — Сарсона', () => {
		expect(flowDfd).toMatchObject({
			id: 'dfd',
			standard: 'DFD · Yourdon — DeMarco, Gane — Sarson',
			defaultNodeKind: 'process',
			defaultEdgeKind: 'flow',
			layout: { algorithm: 'layered', direction: 'LR', routing: 'orthogonal', options: { style: 'gane-sarson' } },
		})
		expect(flowDfd.styles).toBe(dfdStyles)
		expect(Object.keys(flowDfd.styles!)).toEqual(['gane-sarson', 'yourdon-demarco'])
		expect(flowDfd.label()).toBe(UI_FLOW_DFD.NOTATION)
		expect(flowDfd.rulesSummary?.()).toBe(UI_FLOW_DFD.RULES_SUMMARY)
	})

	it('все подписи непустые', () => {
		expect(allLabels(flowDfd).every(Boolean)).toBe(true)
		expect(dfdStyles['gane-sarson'].label()).toBe(UI_FLOW_DFD.STYLE_GANE_SARSON)
		expect(dfdStyles['yourdon-demarco'].label()).toBe(UI_FLOW_DFD.STYLE_YOURDON_DEMARCO)
	})
})

describe('DFD: виды узлов', () => {
	it('процесс — скруглённый прямоугольник, хранилище — открытый, внешняя сущность — прямоугольник', () => {
		expect(dfdNodeKinds.process!.shape.shape).toBe('round-rect')
		expect(dfdNodeKinds.store!.shape.shape).toBe('open-rect')
		expect(dfdNodeKinds.entity!.shape.shape).toBe('rect')
		expect(dfdNodeKinds.entity!.isExternal).toBe(true)
	})

	it('виды подписаны словарём', () => {
		expect(dfdNodeKinds.process!.label()).toBe(UI_FLOW_DFD.PROCESS)
		expect(dfdNodeKinds.store!.label()).toBe(UI_FLOW_DFD.STORE)
		expect(dfdNodeKinds.entity!.label()).toBe(UI_FLOW_DFD.ENTITY)
		expect(dfdNodeKinds.process!.props!.code!.label()).toBe(UI_FLOW_DFD.PROP_CODE)
	})

	it('у сущности поля «Номер» нет, у процесса и хранилища оно есть', () => {
		expect(Object.keys(dfdNodeKinds.process!.props!)).toEqual(['code'])
		expect(Object.keys(dfdNodeKinds.store!.props!)).toEqual(['code'])
		expect(dfdNodeKinds.entity!.props).toBeUndefined()
	})

	it('номер процесса и хранилища — слева сверху; пустой и нестроковый не рисуются', () => {
		for (const kind of ['process', 'store']) {
			const def = dfdNodeKinds[kind]!
			expect(markersOf(def, node('n', kind, { props: { code: '1.0' } }))).toEqual([{ text: '1.0', placement: 'top-start' }])
			expect(markersOf(def, node('n', kind, { props: { code: '' } }))).toEqual([])
			expect(markersOf(def, node('n', kind, { props: { code: 1 } }))).toEqual([])
			expect(markersOf(def, node('n', kind))).toEqual([])
		}
	})

	it('у сущности маркеров нет вовсе', () => {
		expect(dfdNodeKinds.entity!.shape.markers).toBeUndefined()
	})

	it('поток данных — сплошная ортогональная стрелка с движением', () => {
		expect(dfdEdgeKinds.flow).toMatchObject({ stroke: 'solid', endMarker: 'arrow', routing: 'orthogonal', effect: 'travel' })
		expect(dfdEdgeKinds.flow!.traffic).toEqual({ rate: 0.7, speed: 110 })
		expect(dfdEdgeKinds.flow!.label()).toBe(UI_FLOW_DFD.FLOW)
	})
})

describe('DFD: стили дают разные фигуры', () => {
	const gane = dfdStyles['gane-sarson']
	const yourdon = dfdStyles['yourdon-demarco']

	it('Гейн — Сарсон не переопределяет виды: берутся базовые', () => {
		expect(gane.nodeKinds).toEqual({})
	})

	it('Йордон — Де Марко: процесс — круг, хранилище — две линии', () => {
		expect(yourdon.nodeKinds.process!.shape!.shape).toBe('circle')
		expect(yourdon.nodeKinds.store!.shape!.shape).toBe('parallel-lines')
		expect(yourdon.nodeKinds.entity!.shape!.shape).toBe('rect')
	})

	it('фигуры процесса и хранилища в стилях разные', () => {
		expect(yourdon.nodeKinds.process!.shape!.shape).not.toBe(dfdNodeKinds.process!.shape.shape)
		expect(yourdon.nodeKinds.store!.shape!.shape).not.toBe(dfdNodeKinds.store!.shape.shape)
	})

	it('круговой процесс квадратный, номер — под кругом по центру', () => {
		const process = yourdon.nodeKinds.process!
		expect(process.size!.width).toBe(process.size!.height)
		expect(markersOf({ ...dfdNodeKinds.process!, ...process } as never, node('p', 'process', { props: { code: 'P1' } }))).toEqual([
			{ text: 'P1', placement: 'bottom-center' },
		])
		expect(markersOf({ ...dfdNodeKinds.process!, ...process } as never, node('p', 'process'))).toEqual([])
	})

	it('у хранилища и сущности в стиле Йордона маркеров нет', () => {
		expect(yourdon.nodeKinds.store!.shape!.markers).toBeUndefined()
		expect(yourdon.nodeKinds.entity!.shape!.markers).toBeUndefined()
	})
})

describe('DFD: правила связей', () => {
	it('объявляет один вид связи между всеми тремя видами узлов', () => {
		expect(dfdRules.connections).toEqual([{ edge: 'flow', from: ['process', 'store', 'entity'], to: ['process', 'store', 'entity'] }])
	})

	it.each([
		['процесс → процесс', process('a'), process('b')],
		['процесс → хранилище', process('a'), store('b')],
		['хранилище → процесс', store('a'), process('b')],
		['процесс → сущность', process('a'), entity('b')],
		['сущность → процесс', entity('a'), process('b')],
	])('разрешает %s', (_title, source, target) => {
		expect(connect(source, target)).toBe(true)
	})

	it('запрещает связь сущность → сущность', () => {
		expect(connect(entity('a'), entity('b'))).toEqual({ code: 'dfd-entity-entity', message: UI_FLOW_DFD.RULE_ENTITY_ENTITY })
	})

	it('запрещает связь хранилище → хранилище', () => {
		expect(connect(store('a'), store('b'))).toEqual({ code: 'dfd-store-store', message: UI_FLOW_DFD.RULE_STORE_STORE })
	})

	it.each([
		['сущность → хранилище', entity('a'), store('b')],
		['хранилище → сущность', store('a'), entity('b')],
	])('запрещает %s без процесса между ними', (_title, source, target) => {
		expect(connect(source, target)).toEqual({ code: 'dfd-entity-store', message: UI_FLOW_DFD.RULE_ENTITY_STORE })
	})

	it('распознаёт виды с префиксом нотации', () => {
		expect(connect(node('a', 'dfd:process'), node('b', 'dfd:entity'))).toBe(true)
		expect(connect(node('a', 'dfd:entity'), node('b', 'dfd:entity'))).toMatchObject({ code: 'dfd-entity-entity' })
	})
})

describe('DFD: проверка данных', () => {
	it('«чудо»: у процесса нет входящих потоков', () => {
		const nodes = [process('p', { label: 'Расчёт' }), entity('c')]
		expect(validate(nodes, [edge('e1', 'p>c')])).toEqual([
			{
				level: 'warning',
				code: 'dfd-miracle',
				message: formatMessage(UI_FLOW_DFD.WARN_MIRACLE, { name: 'Расчёт' }),
				target: { entity: 'node', id: 'p' },
			},
		])
	})

	it('«чёрная дыра»: у процесса нет исходящих потоков', () => {
		const nodes = [process('p', { label: 'Учёт' }), entity('c')]
		expect(validate(nodes, [edge('e1', 'c>p')])).toEqual([
			{
				level: 'warning',
				code: 'dfd-black-hole',
				message: formatMessage(UI_FLOW_DFD.WARN_BLACK_HOLE, { name: 'Учёт' }),
				target: { entity: 'node', id: 'p' },
			},
		])
	})

	it('процесс без связей получает оба предупреждения, а без подписи называется по id', () => {
		const issues = validate([process('p-7', { label: '' })], [])
		expect(issues.map(issue => issue.code)).toEqual(['dfd-miracle', 'dfd-black-hole'])
		expect(issues[0]!.message).toBe(formatMessage(UI_FLOW_DFD.WARN_MIRACLE, { name: 'p-7' }))
	})

	it('процесс со входом и выходом — без предупреждений; хранилища и сущности не проверяются', () => {
		const nodes = [entity('c'), process('p'), store('s'), entity('free'), store('lonely')]
		const edges = [edge('e1', 'c>p'), edge('e2', 'p>s')]
		expect(validate(nodes, edges)).toEqual([])
	})

	it('распознаёт процессы с префиксом нотации', () => {
		expect(validate([node('p', 'dfd:process')], []).map(issue => issue.code)).toEqual(['dfd-miracle', 'dfd-black-hole'])
	})
})
