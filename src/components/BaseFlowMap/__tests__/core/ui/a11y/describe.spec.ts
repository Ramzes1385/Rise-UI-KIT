import '@testing-library/jest-dom/vitest'
import { nextTick } from 'vue'
import { UI_FLOW_MAP } from '@/locales/messages'
import { mapData, mountMap, runInHost } from '../flowUi'
import { fireEvent, screen } from '@testing-library/vue'
import { useFlowAnnouncer } from '../../../../model/a11y/useFlowAnnouncer'
import { describeEdge, describeLinks, describeNode, statusView } from '../../../../model/a11y/flowDescribe'
import { ARROW_DIRECTIONS, isPrintable, nearestInDirection, typeaheadMatch } from '../../../../model/a11y/flowFocus'

const rect = (x: number, y: number) => ({ x, y, width: 10, height: 10 })

describe('flowFocus', () => {
	it('ARROW_DIRECTIONS знает четыре стрелки', () => {
		expect(ARROW_DIRECTIONS).toEqual({ ArrowLeft: 'left', ArrowRight: 'right', ArrowUp: 'up', ArrowDown: 'down' })
	})

	it('nearestInDirection выбирает ближайший по оси и штрафует отклонение', () => {
		const from = rect(100, 100)
		const candidates = [
			{ id: 'near-off', rect: rect(150, 150) },
			{ id: 'far-on', rect: rect(200, 100) },
			{ id: 'left', rect: rect(0, 100) },
			{ id: 'up', rect: rect(100, 0) },
			{ id: 'down', rect: rect(100, 200) },
			{ id: 'same', rect: rect(100, 100) },
		]
		expect(nearestInDirection(from, candidates, 'right')).toBe('far-on')
		expect(nearestInDirection(from, candidates, 'left')).toBe('left')
		expect(nearestInDirection(from, candidates, 'up')).toBe('up')
		expect(nearestInDirection(from, candidates, 'down')).toBe('down')
		expect(nearestInDirection(from, [{ id: 'same', rect: from }], 'right')).toBeNull()
		expect(nearestInDirection(from, [], 'up')).toBeNull()
	})

	it('typeaheadMatch ищет с узла после текущего для одной буквы и с текущего для длинной строки', () => {
		const items = [
			{ id: 'a', label: 'Alpha' },
			{ id: 'b', label: 'Almond' },
			{ id: 'c', label: 'Gamma' },
		]
		expect(typeaheadMatch(items, 'a', 'a')).toBe('b')
		expect(typeaheadMatch(items, 'a', 'b')).toBe('a')
		expect(typeaheadMatch(items, 'al', 'b')).toBe('b')
		expect(typeaheadMatch(items, 'aa', 'a')).toBe('b')
		expect(typeaheadMatch(items, 'aaa', 'b')).toBe('a')
		expect(typeaheadMatch(items, 'G', null)).toBe('c')
		expect(typeaheadMatch(items, 'zz', 'a')).toBeNull()
		expect(typeaheadMatch([], 'a', null)).toBeNull()
	})

	it('isPrintable пропускает символы без модификаторов и пробела', () => {
		const press = (init: KeyboardEventInit) => isPrintable(new KeyboardEvent('keydown', init))
		expect(press({ key: 'a' })).toBe(true)
		expect(press({ key: 'я' })).toBe(true)
		expect(press({ key: ' ' })).toBe(false)
		expect(press({ key: 'Enter' })).toBe(false)
		expect(press({ key: 'a', ctrlKey: true })).toBe(false)
		expect(press({ key: 'a', metaKey: true })).toBe(false)
		expect(press({ key: 'a', altKey: true })).toBe(false)
	})
})

describe('flowDescribe', () => {
	it('statusView: без статуса — null, встроенные получают подпись и цвет, неизвестный — как есть', () => {
		expect(statusView(undefined, undefined)).toBeNull()
		for (const id of ['ok', 'warning', 'error', 'down', 'unknown']) {
			const view = statusView(id, undefined)
			expect(view?.id).toBe(id)
			expect(view?.label).toBeTruthy()
			expect(view?.color).toMatch(/^var\(--rise-/)
		}
		expect(statusView('paused', undefined)).toMatchObject({ id: 'paused', label: 'paused', icon: 'info' })
	})

	it('statusView: свои определения данных важнее встроенных', () => {
		expect(statusView('ok', [{ id: 'ok', label: 'Норма', color: 'green', icon: 'check' }])).toEqual({
			id: 'ok',
			label: 'Норма',
			color: 'green',
			icon: 'check',
		})
		expect(statusView('down', [{ id: 'ok', label: 'Норма', color: 'green', icon: 'check' }])?.id).toBe('down')
	})

	it('describeNode и describeLinks собирают подписи', () => {
		const node = { id: 'a', kind: 'service', label: 'Alpha' }
		expect(describeNode(node, 'Сервис', null)).toBe('Alpha, Сервис')
		expect(describeNode(node, 'Сервис', { id: 'ok', label: 'Работает', icon: 'x', color: 'y' })).toContain('Работает')
		expect(describeLinks(2, 3)).toContain('2')
		expect(describeLinks(2, 3)).toContain('3')
	})

	it('describeEdge учитывает подпись связи', () => {
		const names = { source: 'A', target: 'B' }
		expect(describeEdge({ id: 'e', source: 'a', target: 'b', label: 'заказ' }, 'Вызов', names)).toBe('Вызов «заказ»: A → B')
		expect(describeEdge({ id: 'e', source: 'a', target: 'b' }, 'Вызов', names)).toBe('Вызов: A → B')
	})
})

describe('useFlowAnnouncer', () => {
	afterEach(() => {
		vi.useRealTimers()
	})

	it('сначала очищает текст, через 50 мс ставит новый — чтобы повтор прочитали заново', () => {
		vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
		const { value } = runInHost(() => useFlowAnnouncer())
		value.announce('первое')
		expect(value.announcement.value).toBe('')
		vi.advanceTimersByTime(49)
		expect(value.announcement.value).toBe('')
		vi.advanceTimersByTime(1)
		expect(value.announcement.value).toBe('первое')
		value.announce('первое')
		expect(value.announcement.value).toBe('')
		value.announce('второе')
		vi.advanceTimersByTime(50)
		expect(value.announcement.value).toBe('второе')
	})

	it('размонтирование отменяет отложенное сообщение', () => {
		vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
		const { value, unmount } = runInHost(() => useFlowAnnouncer())
		value.announce('поздно')
		unmount()
		vi.advanceTimersByTime(100)
		expect(value.announcement.value).toBe('')
	})
})

describe('BaseFlowMap живой регион и список', () => {
	afterEach(() => {
		vi.useRealTimers()
	})

	it('живой регион вежливый, пустой после монтирования и читает выбор спустя мгновение', async () => {
		vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
		mountMap()
		const live = screen.getAllByRole('status').find(item => item.getAttribute('aria-live') === 'polite') as HTMLElement
		expect(live).toHaveAttribute('aria-atomic', 'true')
		expect(live).toHaveTextContent('')
		await fireEvent.click(screen.getByRole('graphics-object', { name: /^Alpha/ }))
		expect(live).toHaveTextContent('')
		vi.advanceTimersByTime(60)
		await nextTick()
		expect(live).toHaveTextContent('Выбрано: Alpha')
	})

	it('скрытый список по умолчанию вне Tab-порядка, но доступен скринридеру и выбирает по кнопке', async () => {
		const result = mountMap()
		const list = screen.getByRole('group', { name: UI_FLOW_MAP.LIST_TITLE })
		expect(list).toHaveClass('base-flow-map__sr')
		expect(list).not.toHaveAttribute('tabindex')
		const buttons = screen.getAllByRole('button', { name: /Alpha|Beta|Gamma|→/ }).filter(item => list.contains(item))
		expect(buttons).toHaveLength(5)
		expect(buttons.every(item => item.getAttribute('tabindex') === '-1')).toBe(true)
		await fireEvent.click(screen.getByRole('button', { name: /^Beta, Сервис/ }))
		expect(result.emitted()['update:selection'].at(-1)).toEqual([['b']])
		await fireEvent.click(screen.getByRole('button', { name: /Alpha → Gamma/ }))
		expect(result.emitted()['update:selection'].at(-1)).toEqual([['e2']])
	})

	it('панель list делает список видимым и доступным по Tab', () => {
		mountMap({ panels: ['list'] })
		const list = screen.getByRole('group', { name: UI_FLOW_MAP.LIST_TITLE })
		expect(list).not.toHaveClass('base-flow-map__sr')
		expect(screen.getByRole('heading', { name: UI_FLOW_MAP.LIST_NODES })).toBeInTheDocument()
		expect(screen.getByRole('heading', { name: UI_FLOW_MAP.LIST_EDGES })).toBeInTheDocument()
		expect(screen.getByRole('button', { name: /^Alpha, Сервис/ })).toHaveAttribute('tabindex', '0')
		expect(list).toHaveAttribute('tabindex', '0')
	})

	it('при загрузке и ошибке скрытого списка нет', async () => {
		const { rerender } = mountMap({ isLoading: true })
		expect(screen.queryByRole('group', { name: UI_FLOW_MAP.LIST_TITLE })).not.toBeInTheDocument()
		await rerender({ isLoading: false, error: 'сбой' })
		expect(screen.queryByRole('group', { name: UI_FLOW_MAP.LIST_TITLE })).not.toBeInTheDocument()
		await rerender({ error: undefined, data: mapData() })
		expect(screen.getByRole('group', { name: UI_FLOW_MAP.LIST_TITLE })).toBeInTheDocument()
	})

	it('подсказка по клавишам привязана к области через aria-describedby', () => {
		mountMap()
		const board = screen.getByRole('graphics-document')
		const hint = document.getElementById(board.getAttribute('aria-describedby') as string)
		expect(hint).toHaveTextContent(UI_FLOW_MAP.KEYBOARD_HINT)
	})
})
