import { node } from '../fixtures/idefData'
import { UI_FLOW_IDEF } from '@/locales/messages'
import { flowIdef3 } from '../../model/notations/idef3'
import { allLabels, markersOf, propLabels } from '../fixtures/kindHelpers'
import { idef3EdgeKinds, idef3Gateways, idef3NodeKinds } from '../../model/notations/idef3/idef3Kinds'

describe('IDEF3: нотация', () => {
	it('собирает определение с семантикой соединений и обходом', () => {
		expect(flowIdef3).toMatchObject({
			id: 'idef3',
			standard: 'IDEF3 · KBSI 1995',
			defaultNodeKind: 'uob',
			defaultEdgeKind: 'precedence',
			layout: { algorithm: 'layered', direction: 'LR', routing: 'orthogonal' },
		})
		expect(flowIdef3.semantics?.gateways).toBe(idef3Gateways)
		expect(flowIdef3.semantics?.simulate).toBeTypeOf('function')
		expect(flowIdef3.label()).toBe(UI_FLOW_IDEF.NOTATION_IDEF3)
		expect(flowIdef3.rulesSummary?.()).toBe(UI_FLOW_IDEF.RULES_SUMMARY_IDEF3)
	})

	it('все подписи видов, полей и связей непустые', () => {
		expect(allLabels(flowIdef3).every(Boolean)).toBe(true)
	})

	it('соединения &, O и X разветвляют и сливают по-разному', () => {
		expect(idef3Gateways).toEqual({
			'junction-and': { split: 'all', join: 'all' },
			'junction-or': { split: 'some', join: 'some' },
			'junction-xor': { split: 'one', join: 'one' },
		})
	})
})

describe('IDEF3: единица поведения (UOB)', () => {
	const def = idef3NodeKinds.uob!

	it('прямоугольник с подписью внутри и двумя полями', () => {
		expect(def).toMatchObject({ render: 'svg', labelPlacement: 'inside', shape: { shape: 'rect' }, size: { width: 128, height: 64 } })
		expect(def.label()).toBe(UI_FLOW_IDEF.UOB)
		expect(propLabels(def)).toEqual([UI_FLOW_IDEF.PROP_NUMBER, UI_FLOW_IDEF.PROP_REF])
	})

	it('номер UOB — слева внизу (строка или число), функция IDEF0 — справа внизу', () => {
		expect(markersOf(def, node('u', 'uob', { props: { number: '1.2', ref: 'A3' } }))).toEqual([
			{ text: '1.2', placement: 'bottom-start' },
			{ text: 'A3', placement: 'bottom-end' },
		])
		expect(markersOf(def, node('u', 'uob', { props: { number: 0 } }))).toEqual([{ text: '0', placement: 'bottom-start' }])
	})

	it('пустая ссылка и отсутствие полей не рисуются', () => {
		expect(markersOf(def, node('u', 'uob', { props: { ref: '' } }))).toEqual([])
		expect(markersOf(def, node('u', 'uob', { props: { number: true, ref: 5 } }))).toEqual([])
		expect(markersOf(def, node('u', 'uob'))).toEqual([])
	})
})

describe('IDEF3: соединения', () => {
	it.each([
		['junction-and', '&', UI_FLOW_IDEF.JUNCTION_AND],
		['junction-or', 'O', UI_FLOW_IDEF.JUNCTION_OR],
		['junction-xor', 'X', UI_FLOW_IDEF.JUNCTION_XOR],
	])('«%s» подписано буквой %s и словарным названием', (kind, letter, label) => {
		const def = idef3NodeKinds[kind]!
		expect(def.label()).toBe(label)
		expect(def).toMatchObject({ labelPlacement: 'none', size: { width: 24, height: 56 } })
		expect(markersOf(def, node('j', kind))).toEqual([
			{ path: 'M4 2v20', placement: 'center' },
			{ text: letter, placement: 'center' },
		])
	})

	it('синхронное соединение рисуется двойной чертой', () => {
		const markers = markersOf(idef3NodeKinds['junction-and']!, node('j', 'junction-and', { props: { isSynchronous: true } }))
		expect(markers).toEqual([
			{ path: 'M4 2v20', placement: 'center' },
			{ path: 'M20 2v20', placement: 'center' },
			{ text: '&', placement: 'center' },
		])
	})

	it('асинхронное (isSynchronous: false или без поля) — одна черта', () => {
		const def = idef3NodeKinds['junction-or']!
		expect(markersOf(def, node('j', 'junction-or', { props: { isSynchronous: false } }))).toHaveLength(2)
		expect(markersOf(def, node('j', 'junction-or', { props: { isSynchronous: 'да' } }))).toHaveLength(2)
	})

	it('поле «Синхронное» — переключатель, по умолчанию выключен', () => {
		const prop = idef3NodeKinds['junction-xor']!.props!.isSynchronous!
		expect(prop).toMatchObject({ type: 'boolean', default: false })
		expect(prop.label()).toBe(UI_FLOW_IDEF.PROP_SYNCHRONOUS)
	})
})

describe('IDEF3: ссылка-референт', () => {
	const def = idef3NodeKinds.referent!

	it('скруглённая пунктирная рамка', () => {
		expect(def.shape).toMatchObject({ shape: 'round-rect', ring: 'dashed' })
		expect(def.label()).toBe(UI_FLOW_IDEF.REFERENT)
	})

	it.each([
		['goto', UI_FLOW_IDEF.REFERENT_GOTO],
		['object', UI_FLOW_IDEF.REFERENT_OBJECT],
		['scenario', UI_FLOW_IDEF.REFERENT_SCENARIO],
	])('тип «%s» подписан словарём, цель — слева внизу', (type, label) => {
		expect(markersOf(def, node('r', 'referent', { props: { type, target: 'UOB 4' } }))).toEqual([
			{ text: label, placement: 'top-start' },
			{ text: 'UOB 4', placement: 'bottom-start' },
		])
	})

	it('без типа это GOTO, пустая цель не рисуется', () => {
		expect(markersOf(def, node('r', 'referent', { props: { type: 'другое', target: '' } }))).toEqual([
			{ text: UI_FLOW_IDEF.REFERENT_GOTO, placement: 'top-start' },
		])
		expect(markersOf(def, node('r', 'referent'))).toEqual([{ text: UI_FLOW_IDEF.REFERENT_GOTO, placement: 'top-start' }])
	})

	it('поле «Тип ссылки» перечисляет три типа', () => {
		const type = def.props!.type!
		expect(type).toMatchObject({ type: 'select', default: 'goto' })
		expect(type.options?.map(option => [option.value, option.label()])).toEqual([
			['goto', UI_FLOW_IDEF.REFERENT_GOTO],
			['object', UI_FLOW_IDEF.REFERENT_OBJECT],
			['scenario', UI_FLOW_IDEF.REFERENT_SCENARIO],
		])
	})
})

describe('IDEF3: виды связей', () => {
	it('предшествование — сплошная стрелка, отношение — пунктир без стрелки, поток объекта — двойная стрелка', () => {
		expect(idef3EdgeKinds.precedence).toMatchObject({ stroke: 'solid', endMarker: 'arrow', effect: 'travel' })
		expect(idef3EdgeKinds.relational).toMatchObject({ stroke: 'dashed', endMarker: 'none', effect: 'draw' })
		expect(idef3EdgeKinds['object-flow']).toMatchObject({ stroke: 'solid', endMarker: 'double-arrow', effect: 'travel' })
		expect(idef3EdgeKinds.relational!.traffic).toBeUndefined()
	})

	it('связи подписаны словарём', () => {
		expect(idef3EdgeKinds.precedence!.label()).toBe(UI_FLOW_IDEF.PRECEDENCE)
		expect(idef3EdgeKinds.relational!.label()).toBe(UI_FLOW_IDEF.RELATIONAL)
		expect(idef3EdgeKinds['object-flow']!.label()).toBe(UI_FLOW_IDEF.OBJECT_FLOW)
	})
})
