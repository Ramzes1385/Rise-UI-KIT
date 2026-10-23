import '@testing-library/jest-dom/vitest'
import { nextTick } from 'vue'
import BaseSearch from '../ui/BaseSearch.vue'
import type { SearchResult } from '../types/BaseSearch.types'
import { fireEvent, render, screen } from '@testing-library/vue'

vi.mock('@composables/overlay/useClickOutside', () => ({ useClickOutside: vi.fn() }))
vi.mock('@composables/overlay/useEscapeKey', () => ({ useEscapeKey: vi.fn() }))
vi.mock('@composables/overlay/useScrollLock', () => ({ useScrollLock: () => ({ lock: vi.fn(), unlock: vi.fn() }) }))

interface PendingRequest {
	query: string
	signal: AbortSignal
	resolve: (results: SearchResult[]) => void
	reject: (error: Error) => void
}

function createSource() {
	const requests: PendingRequest[] = []
	const source = vi.fn(
		(query: string, { signal }: { signal: AbortSignal }) =>
			new Promise<SearchResult[]>((resolve, reject) => {
				requests.push({ query, signal, resolve, reject })
			}),
	)
	return { source, requests }
}

const item = (id: number, title: string): SearchResult => ({ id, title })
const optionTitles = (): string[] => screen.queryAllByRole('option').map(option => option.textContent?.trim() ?? '')
const field = (): HTMLElement => screen.getByRole('combobox')

async function type(value: string): Promise<void> {
	await fireEvent.focus(field())
	await fireEvent.update(field(), value)
}

async function settle(): Promise<void> {
	await vi.advanceTimersByTimeAsync(1)
	await nextTick()
}

describe('BaseSearch: source и защита от гонок ответов (SRCH-2)', () => {
	beforeEach(() => {
		vi.useFakeTimers()
	})
	afterEach(() => {
		vi.useRealTimers()
	})

	it('вызывает source с запросом и сигналом после debounce и всё равно эмитит search', async () => {
		const { source, requests } = createSource()
		const { emitted } = render(BaseSearch, { props: { source, debounceMs: 200 } })
		await type('закат')
		expect(source).not.toHaveBeenCalled()

		await vi.advanceTimersByTimeAsync(201)
		expect(source).toHaveBeenCalledTimes(1)
		expect(requests[0].query).toBe('закат')
		expect(requests[0].signal.aborted).toBe(false)
		expect(emitted().search).toEqual([['закат']])
	})

	it('показывает ответ источника как есть (без фильтрации по подстроке) и озвучивает число результатов', async () => {
		const { source, requests } = createSource()
		render(BaseSearch, { props: { source, debounceMs: 0 } })
		await type('zakat')
		await settle()
		requests[0].resolve([item(1, 'Закат в горах'), item(2, 'Вечер у моря')])
		await settle()
		expect(optionTitles()).toEqual(['Закат в горах', 'Вечер у моря'])
		expect(document.querySelector('.base-search__live')).toHaveTextContent('Найдено 2 результата')
	})

	it('поздний ответ на старый запрос не перезаписывает ответ на новый, старый запрос отменён', async () => {
		const { source, requests } = createSource()
		render(BaseSearch, { props: { source, debounceMs: 100 } })
		await type('ка')
		await vi.advanceTimersByTimeAsync(101)
		await type('кар')
		await vi.advanceTimersByTimeAsync(101)
		expect(requests.map(request => request.query)).toEqual(['ка', 'кар'])
		expect(requests[0].signal.aborted).toBe(true)
		expect(requests[1].signal.aborted).toBe(false)

		requests[1].resolve([item(2, 'Карта')])
		await settle()
		requests[0].resolve([item(1, 'Каток')])
		await settle()
		expect(optionTitles()).toEqual(['Карта'])
	})

	it('ответ, пришедший после очистки поля, не показывается', async () => {
		const { source, requests } = createSource()
		render(BaseSearch, { props: { source, debounceMs: 0 } })
		await type('ка')
		await vi.advanceTimersByTimeAsync(1)
		expect(requests).toHaveLength(1)

		await fireEvent.update(field(), '')
		expect(requests[0].signal.aborted).toBe(true)
		requests[0].resolve([item(1, 'Каток')])
		await settle()
		expect(optionTitles()).toEqual([])

		await type('к')
		await vi.advanceTimersByTimeAsync(1)
		requests[1].resolve([item(2, 'Касса')])
		await settle()
		expect(optionTitles()).toEqual(['Касса'])
	})

	it('пока запрос идёт, поиск в состоянии загрузки, статус для скринридера пуст', async () => {
		const { source, requests } = createSource()
		const { container } = render(BaseSearch, { props: { source, debounceMs: 0 } })
		await type('ка')
		await vi.advanceTimersByTimeAsync(1)
		await nextTick()
		expect(container.querySelector('.base-search--loading')).not.toBeNull()
		expect(document.querySelector('.base-search__live')).toBeEmptyDOMElement()

		requests[0].resolve([item(1, 'Каток')])
		await settle()
		expect(container.querySelector('.base-search--loading')).toBeNull()
	})

	it('ошибка источника очищает список и не оставляет необработанного отклонения', async () => {
		const { source, requests } = createSource()
		render(BaseSearch, { props: { source, debounceMs: 0 } })
		await type('ка')
		await vi.advanceTimersByTimeAsync(1)
		requests[0].reject(new Error('network'))
		await settle()
		expect(optionTitles()).toEqual([])
		expect(screen.queryByText('Ничего не найдено')).toBeNull()
		expect(screen.getAllByText('Не удалось выполнить поиск. Попробуйте ещё раз').length).toBeGreaterThan(0)
		expect(document.querySelector('.base-search__live')).toHaveTextContent('Не удалось выполнить поиск')
	})

	it('после ошибки следующий запрос снова показывает «Ничего не найдено» для пустого ответа', async () => {
		const { source, requests } = createSource()
		render(BaseSearch, { props: { source, debounceMs: 0 } })
		await type('ка')
		await vi.advanceTimersByTimeAsync(1)
		requests[0].reject(new Error('network'))
		await settle()
		await type('кар')
		await vi.advanceTimersByTimeAsync(1)
		requests[1].resolve([])
		await settle()
		expect(screen.queryByText('Не удалось выполнить поиск. Попробуйте ещё раз')).toBeNull()
		expect(screen.getAllByText('Ничего не найдено').length).toBeGreaterThan(0)
	})

	it('внешняя смена modelValue отменяет идущий запрос и сбрасывает загрузку', async () => {
		const { source, requests } = createSource()
		const { container, rerender } = render(BaseSearch, { props: { source, debounceMs: 0, modelValue: '' } })
		await type('ка')
		await vi.advanceTimersByTimeAsync(1)
		expect(requests[0].signal.aborted).toBe(false)

		await rerender({ source, debounceMs: 0, modelValue: 'другое' })
		expect(requests[0].signal.aborted).toBe(true)
		requests[0].resolve([item(1, 'Каток')])
		await settle()
		expect(optionTitles()).toEqual([])
		expect(container.querySelector('.base-search--loading')).toBeNull()
	})

	it('внешняя смена modelValue без source ничего не отменяет и не падает', async () => {
		const { rerender } = render(BaseSearch, { props: { results: [item(1, 'Каток')], modelValue: '' } })
		await rerender({ results: [item(1, 'Каток')], modelValue: 'ка' })
		expect(field()).toHaveValue('ка')
	})

	it('без instant источник вызывается по Enter', async () => {
		const { source, requests } = createSource()
		render(BaseSearch, { props: { source, isInstant: false } })
		await type('ка')
		await vi.advanceTimersByTimeAsync(1000)
		expect(source).not.toHaveBeenCalled()

		await fireEvent.keyDown(field(), { key: 'Enter' })
		await vi.advanceTimersByTimeAsync(1)
		expect(source).toHaveBeenCalledTimes(1)
		requests[0].resolve([item(1, 'Каток')])
		await settle()
		expect(optionTitles()).toEqual(['Каток'])
	})

	it('при размонтировании активный запрос отменяется', async () => {
		const { source, requests } = createSource()
		const { unmount } = render(BaseSearch, { props: { source, debounceMs: 0 } })
		await type('ка')
		await vi.advanceTimersByTimeAsync(1)
		unmount()
		expect(requests[0].signal.aborted).toBe(true)
	})
})

describe('BaseSearch: клавиатура и закрытый список (SRCH-3, SRCH-10)', () => {
	const RESULTS = [item(1, 'Закат'), item(2, 'Закуски')]

	it('после Escape ввод снова открывает список (фокус остался в поле)', async () => {
		render(BaseSearch, { props: { modelValue: 'за', results: RESULTS } })
		await fireEvent.focus(field())
		expect(field()).toHaveAttribute('aria-expanded', 'true')

		await fireEvent.keyDown(field(), { key: 'Escape' })
		await fireEvent.blur(field())
		expect(field()).toHaveAttribute('aria-expanded', 'false')
		await fireEvent.update(field(), 'зак')
		expect(field()).toHaveAttribute('aria-expanded', 'true')
	})

	it('при закрытом списке ArrowDown открывает его, а не двигает скрытую подсветку', async () => {
		const { emitted } = render(BaseSearch, { props: { modelValue: 'за', results: RESULTS } })
		await fireEvent.focus(field())
		await fireEvent.blur(field())
		expect(field()).toHaveAttribute('aria-expanded', 'false')

		await fireEvent.keyDown(field(), { key: 'ArrowDown' })
		expect(field()).toHaveAttribute('aria-expanded', 'true')
		expect(field()).not.toHaveAttribute('aria-activedescendant')
		expect(emitted().select).toBeUndefined()
	})

	it('без мгновенного поиска ↓ не гасится, пока Enter не запускал поиск: открывать нечего', async () => {
		render(BaseSearch, { props: { modelValue: 'за', results: RESULTS, isInstant: false } })
		await fireEvent.focus(field())
		await fireEvent.blur(field())
		const down = new KeyboardEvent('keydown', { key: 'ArrowDown', cancelable: true, bubbles: true })
		field().dispatchEvent(down)
		expect(down.defaultPrevented).toBe(false)
	})

	it('после запуска поиска по Enter ↓ при закрытом списке открывает его и гасится', async () => {
		render(BaseSearch, { props: { modelValue: 'за', results: RESULTS, isInstant: false } })
		await fireEvent.focus(field())
		await fireEvent.keyDown(field(), { key: 'Enter' })
		await fireEvent.blur(field())
		const down = new KeyboardEvent('keydown', { key: 'ArrowDown', cancelable: true, bubbles: true })
		field().dispatchEvent(down)
		expect(down.defaultPrevented).toBe(true)
		await nextTick()
		expect(field()).toHaveAttribute('aria-expanded', 'true')
	})

	it('при закрытом списке Enter не выбирает скрытый пункт', async () => {
		const { emitted } = render(BaseSearch, { props: { modelValue: 'за', results: RESULTS } })
		await fireEvent.focus(field())
		await fireEvent.keyDown(field(), { key: 'ArrowDown' })
		await fireEvent.keyDown(field(), { key: 'Escape' })
		await fireEvent.blur(field())
		await fireEvent.keyDown(field(), { key: 'Enter' })
		expect(emitted().select).toBeUndefined()
	})

	it('ArrowDown и Enter без запроса ничего не делают, Enter не отменяется (форма отправится)', async () => {
		render(BaseSearch, { props: { modelValue: '', results: RESULTS } })
		await fireEvent.focus(field())
		const down = new KeyboardEvent('keydown', { key: 'ArrowDown', cancelable: true, bubbles: true })
		field().dispatchEvent(down)
		expect(down.defaultPrevented).toBe(false)
		const enter = new KeyboardEvent('keydown', { key: 'Enter', cancelable: true, bubbles: true })
		field().dispatchEvent(enter)
		expect(enter.defaultPrevented).toBe(false)
	})

	it('Enter во время композиции IME не запускает поиск и не выбирает пункт', async () => {
		const { emitted } = render(BaseSearch, { props: { modelValue: 'за', results: RESULTS } })
		await fireEvent.focus(field())
		await fireEvent.keyDown(field(), { key: 'ArrowDown' })
		await fireEvent.keyDown(field(), { key: 'Enter', isComposing: true })
		expect(emitted().select).toBeUndefined()
		expect(emitted().search).toBeUndefined()
	})

	it('внешняя смена modelValue отменяет отложенный search со старым значением', async () => {
		vi.useFakeTimers()
		const { emitted, rerender } = render(BaseSearch, { props: { modelValue: '', results: RESULTS, debounceMs: 300 } })
		await fireEvent.update(field(), 'стар')
		await rerender({ modelValue: 'нов', results: RESULTS, debounceMs: 300 })
		await vi.advanceTimersByTimeAsync(500)
		expect(emitted().search).toBeUndefined()
		vi.useRealTimers()
	})
})
