import { formatMessage } from '@/locales/state'
import { UI_FLOW_IDEF } from '@/locales/messages'
import { flowIdef0 } from '../../model/notations/idef0'
import { boundary, fn, node } from '../fixtures/idefData'
import { allLabels, markersOf, propLabels } from '../fixtures/kindHelpers'
import { IDEF0_BOUNDARY_ROLES, IDEF0_PORT_ROLES } from '../../types/notations/process/idef.types'
import { idef0EdgeKinds, idef0NodeKinds, idef0RoleLabel } from '../../model/notations/idef0/idef0Kinds'

describe('IDEF0: нотация', () => {
	it('собирает определение нотации с лесенкой, правилами и обходом', () => {
		expect(flowIdef0).toMatchObject({
			id: 'idef0',
			standard: 'FIPS PUB 183 · IEEE 1320.1-1998',
			defaultNodeKind: 'function',
			defaultEdgeKind: 'arrow',
			layout: { algorithm: 'idef0-staircase', direction: 'LR', routing: 'orthogonal' },
		})
		expect(flowIdef0.layouts?.map(item => item.id)).toEqual(['idef0-staircase'])
		expect(flowIdef0.rules?.canConnect).toBeTypeOf('function')
		expect(flowIdef0.semantics?.simulate).toBeTypeOf('function')
	})

	it('подписывает нотацию и сводку правил из словаря', () => {
		expect(flowIdef0.label()).toBe(UI_FLOW_IDEF.NOTATION_IDEF0)
		expect(flowIdef0.rulesSummary?.()).toBe(UI_FLOW_IDEF.RULES_SUMMARY_IDEF0)
	})

	it('все подписи видов, полей и портов непустые', () => {
		expect(allLabels(flowIdef0).every(Boolean)).toBe(true)
	})
})

describe('IDEF0: роли ICOM', () => {
	it.each([
		['input', UI_FLOW_IDEF.PORT_INPUT],
		['control', UI_FLOW_IDEF.PORT_CONTROL],
		['output', UI_FLOW_IDEF.PORT_OUTPUT],
		['mechanism', UI_FLOW_IDEF.PORT_MECHANISM],
		['call', UI_FLOW_IDEF.PORT_CALL],
	])('роль «%s» подписана словарём', (role, label) => {
		expect(idef0RoleLabel(role)).toBe(label)
	})

	it('неизвестную роль возвращает как есть', () => {
		expect(idef0RoleLabel('custom')).toBe('custom')
	})

	it('порты функции стоят по сторонам ICOM: вход слева, управление сверху, выход справа, механизм снизу', () => {
		const ports = idef0NodeKinds.function!.ports!
		expect(ports.map(item => item.id)).toEqual([...IDEF0_PORT_ROLES])
		const sides = Object.fromEntries(ports.map(item => [item.id, item.side]))
		expect(sides).toEqual({ input: 'left', control: 'top', output: 'right', mechanism: 'bottom', call: 'bottom' })
		const directions = Object.fromEntries(ports.map(item => [item.id, item.direction]))
		expect(directions).toMatchObject({ input: 'in', control: 'in', output: 'out', mechanism: 'in', call: 'out' })
	})

	it('подписи портов читаются в момент обращения', () => {
		const ports = idef0NodeKinds.function!.ports!
		expect(ports.map(item => item.label)).toEqual([
			UI_FLOW_IDEF.PORT_INPUT,
			UI_FLOW_IDEF.PORT_CONTROL,
			UI_FLOW_IDEF.PORT_OUTPUT,
			UI_FLOW_IDEF.PORT_MECHANISM,
			UI_FLOW_IDEF.PORT_CALL,
		])
	})
})

describe('IDEF0: вид «функция»', () => {
	const def = idef0NodeKinds.function!

	it('рисуется прямоугольником с подписью внутри', () => {
		expect(def).toMatchObject({ render: 'svg', labelPlacement: 'inside', shape: { shape: 'rect' } })
		expect(def.label()).toBe(UI_FLOW_IDEF.FUNCTION)
		expect(propLabels(def)).toEqual([UI_FLOW_IDEF.PROP_CODE, UI_FLOW_IDEF.PROP_PAGE])
	})

	it('номер — справа внизу, страница — слева внизу со словарной подписью', () => {
		expect(markersOf(def, fn('a', 'A2', { props: { code: 'A2', page: '3' } }))).toEqual([
			{ text: 'A2', placement: 'bottom-end' },
			{ text: formatMessage(UI_FLOW_IDEF.PAGE, { page: '3' }), placement: 'bottom-start' },
		])
	})

	it('пустые и нестроковые номер и страница не рисуются', () => {
		expect(markersOf(def, fn('a', '', { props: { code: '', page: '' } }))).toEqual([])
		expect(markersOf(def, fn('a', undefined, { props: { code: 2, page: 1 } }))).toEqual([])
		expect(markersOf(def, node('a', 'function'))).toEqual([])
	})
})

describe('IDEF0: вид «граничная стрелка»', () => {
	const def = idef0NodeKinds.boundary!

	it('невидимая рамка, подпись внутри, без портов', () => {
		expect(def).toMatchObject({ render: 'svg', labelPlacement: 'inside', shape: { fill: 'transparent', stroke: 'transparent' } })
		expect(def.ports).toBeUndefined()
		expect(def.label()).toBe(UI_FLOW_IDEF.BOUNDARY)
	})

	it('поле «Роль стрелки» перечисляет четыре роли с подписями', () => {
		const icom = def.props!.icom!
		expect(icom).toMatchObject({ type: 'select', default: 'input' })
		expect(icom.options?.map(option => option.value)).toEqual([...IDEF0_BOUNDARY_ROLES])
		expect(icom.options?.map(option => option.label())).toEqual([
			UI_FLOW_IDEF.PORT_INPUT,
			UI_FLOW_IDEF.PORT_CONTROL,
			UI_FLOW_IDEF.PORT_OUTPUT,
			UI_FLOW_IDEF.PORT_MECHANISM,
		])
	})

	it('поля кода, роли и туннеля подписаны', () => {
		expect(propLabels(def)).toContain(UI_FLOW_IDEF.PROP_BOUNDARY_CODE)
		expect(def.props!.isTunnel).toMatchObject({ type: 'boolean', default: false })
		expect(def.props!.isTunnel!.label()).toBe(UI_FLOW_IDEF.PROP_TUNNEL)
	})

	it('код — слева сверху, туннель — скобки справа снизу', () => {
		expect(markersOf(def, boundary('b', 'input', { props: { code: 'I1', isTunnel: true } }))).toEqual([
			{ text: 'I1', placement: 'top-start' },
			{ text: '( )', placement: 'bottom-end' },
		])
	})

	it('без кода и без туннеля маркеров нет', () => {
		expect(markersOf(def, boundary('b', 'input'))).toEqual([])
		expect(markersOf(def, node('b', 'boundary'))).toEqual([])
		expect(markersOf(def, boundary('b', 'input', { props: { code: '', isTunnel: false } }))).toEqual([])
	})
})

describe('IDEF0: связь «стрелка»', () => {
	it('сплошная ортогональная со стрелкой на конце и движением по пути', () => {
		const arrow = idef0EdgeKinds.arrow!
		expect(arrow).toMatchObject({ stroke: 'solid', endMarker: 'arrow', routing: 'orthogonal', effect: 'travel' })
		expect(arrow.traffic).toEqual({ rate: 0.6, speed: 110 })
		expect(arrow.label()).toBe(UI_FLOW_IDEF.ARROW)
	})
})
