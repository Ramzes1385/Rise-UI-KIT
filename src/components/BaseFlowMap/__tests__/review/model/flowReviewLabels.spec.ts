import { formatMessage } from '@/locales/state'
import { UI_FLOW_REVIEW } from '@/locales/messages'
import type { FlowChange } from '../../../types/data/flowReview.types'
import { elementName, entityOfId, suggestionTitle } from '../../../model/review/flowReviewLabels'
import { addEdgeD, addNodeD, moveB, removeC, renameA, reviewData } from '../fixtures/reviewHarness'

const data = reviewData({ groups: [{ id: 'g', kind: 'zone', label: 'Зона' }] })

describe('elementName', () => {
	it('узел: подпись из значения, из данных или id', () => {
		expect(elementName({ entity: 'node', id: 'x', value: { label: 'Из значения' } }, data)).toBe('Из значения')
		expect(elementName({ entity: 'node', id: 'a' }, data)).toBe('Alpha')
		expect(elementName({ entity: 'node', id: 'zzz' }, data)).toBe('zzz')
	})

	it('группа берётся из groups, карта без групп даёт id', () => {
		expect(elementName({ entity: 'group', id: 'g' }, data)).toBe('Зона')
		expect(elementName({ entity: 'group', id: 'g' }, reviewData())).toBe('g')
	})

	it('связь: своя подпись, иначе «откуда → куда», иначе id', () => {
		expect(elementName({ entity: 'edge', id: 'e1' }, data)).toBe('заказ')
		expect(elementName({ entity: 'edge', id: 'e2' }, data)).toBe('Alpha → Gamma')
		expect(elementName({ entity: 'edge', id: 'e3', value: { source: 'a', target: 'nope' } }, data)).toBe('Alpha → nope')
		expect(elementName({ entity: 'edge', id: 'e9' }, data)).toBe('e9')
		expect(elementName({ entity: 'edge', id: 'e9', value: {} }, data)).toBe('e9')
	})
})

describe('entityOfId', () => {
	it('узел, связь или группа по id', () => {
		expect(entityOfId(data, 'a')).toBe('node')
		expect(entityOfId(data, 'e1')).toBe('edge')
		expect(entityOfId(data, 'g')).toBe('group')
	})
})

describe('suggestionTitle', () => {
	it('переименование: «было → стало»', () => {
		expect(suggestionTitle([renameA], data)).toBe('Alpha → Альфа')
	})

	it('переименование безымянного узла: пустое «было»', () => {
		const first: FlowChange = { type: 'update', entity: 'node', id: 'a', patch: { label: 'Новый' }, previous: {} }
		expect(suggestionTitle([first], data)).toBe(' → Новый')
	})

	it('переименование в пустую подпись: пустое «стало»', () => {
		const cleared: FlowChange = { type: 'update', entity: 'node', id: 'a', patch: { label: undefined }, previous: { label: 'Alpha' } }
		expect(suggestionTitle([cleared], data)).toBe('Alpha → ')
	})

	it('добавление, удаление, перенос, изменение', () => {
		expect(suggestionTitle([addNodeD], data)).toBe(formatMessage(UI_FLOW_REVIEW.TITLE_ADD, { name: 'Delta' }))
		expect(suggestionTitle([removeC], data)).toBe(formatMessage(UI_FLOW_REVIEW.TITLE_REMOVE, { name: 'Gamma' }))
		expect(suggestionTitle([moveB], data)).toBe(formatMessage(UI_FLOW_REVIEW.TITLE_MOVE, { name: 'Beta' }))
		const color: FlowChange = { type: 'update', entity: 'node', id: 'a', patch: { color: 'red' }, previous: {} }
		expect(suggestionTitle([color], data)).toBe(formatMessage(UI_FLOW_REVIEW.TITLE_UPDATE, { name: 'Alpha' }))
	})

	it('главный — узел, остальные считаются отдельными элементами: «… и ещё N»', () => {
		const title = suggestionTitle([addEdgeD, addNodeD, moveB], data)
		expect(title).toBe(
			formatMessage(UI_FLOW_REVIEW.TITLE_MORE, { title: formatMessage(UI_FLOW_REVIEW.TITLE_ADD, { name: 'Delta' }), n: 2 }),
		)
	})

	it('без узлов главным берётся первое изменение', () => {
		expect(suggestionTitle([addEdgeD], data)).toBe(formatMessage(UI_FLOW_REVIEW.TITLE_ADD, { name: 'Beta → d' }))
	})

	it('нечего показать — подпись по умолчанию', () => {
		expect(suggestionTitle([], data)).toBe(UI_FLOW_REVIEW.SUGGESTION_UNTITLED)
		expect(suggestionTitle([{ type: 'root', patch: {}, previous: {} }], data)).toBe(UI_FLOW_REVIEW.SUGGESTION_UNTITLED)
	})
})
