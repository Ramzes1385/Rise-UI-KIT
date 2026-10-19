import { UI_FLOW_REVIEW } from '@/locales/messages'
import { formatCount, formatValue, kindLabel, kindStatus, summaryText } from '../../../model/review/panel/reviewFormat'

describe('formatCount', () => {
	it('выбирает форму по числу на текущем языке', () => {
		expect(formatCount(UI_FLOW_REVIEW.NOUN_NODE, 1)).toBe('1 узел')
		expect(formatCount(UI_FLOW_REVIEW.NOUN_NODE, 3)).toBe('3 узла')
		expect(formatCount(UI_FLOW_REVIEW.NOUN_NODE, 5)).toBe('5 узлов')
	})

	it('если форм меньше, чем категорий, берёт последнюю', () => {
		expect(formatCount('{n} шт.', 5)).toBe('5 шт.')
	})
})

describe('formatCount: категории, которых нет в записи форм', () => {
	it('нулевая и двойная категория берут последнюю форму', () => {
		const select = vi.spyOn(Intl.PluralRules.prototype, 'select').mockReturnValue('zero')
		expect(formatCount(UI_FLOW_REVIEW.NOUN_EDGE, 0)).toBe('0 связи')
		select.mockRestore()
	})
})

describe('summaryText', () => {
	it('«+2 узла, −1 связь, ~1 группа»', () => {
		expect(
			summaryText([
				{ kind: 'add', entity: 'node', count: 2 },
				{ kind: 'remove', entity: 'edge', count: 1 },
				{ kind: 'update', entity: 'group', count: 1 },
			]),
		).toBe('+2 узла, −1 связь, ~1 группа')
	})

	it('сценарий и неизвестная сущность', () => {
		expect(summaryText([{ kind: 'add', entity: 'scenario', count: 1 }])).toBe('+1 сценарий')
		expect(summaryText([{ kind: 'add', entity: 'port', count: 2 }])).toBe('+2 узла')
	})

	it('пустая сводка — пустая строка', () => {
		expect(summaryText([])).toBe('')
	})
})

describe('вид предложения', () => {
	it('подписи и статусы значков', () => {
		expect(kindLabel('add')).toBe(UI_FLOW_REVIEW.KIND_ADD)
		expect(kindLabel('mixed')).toBe(UI_FLOW_REVIEW.KIND_MIXED)
		expect(['add', 'remove', 'rename', 'move', 'update', 'mixed'].map(kind => kindStatus(kind as 'add'))).toEqual([
			'success',
			'error',
			'warning',
			'info',
			'warning',
			'neutral',
		])
	})
})

describe('formatValue', () => {
	it('пусто — тире, объект — JSON, остальное — строка', () => {
		expect(formatValue(undefined)).toBe('—')
		expect(formatValue(null)).toBe('—')
		expect(formatValue({ x: 1 })).toBe('{"x":1}')
		expect(formatValue(5)).toBe('5')
		expect(formatValue('a')).toBe('a')
	})
})
