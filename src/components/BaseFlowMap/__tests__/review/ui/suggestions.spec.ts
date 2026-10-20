import '@testing-library/jest-dom/vitest'
import { formatMessage } from '@/locales/state'
import { UI_FLOW_REVIEW } from '@/locales/messages'
import userEvent from '@testing-library/user-event'
import { screen, waitFor, within } from '@testing-library/vue'
import type { FlowVersion } from '../../../types/data/flowReview.types'
import { fired, mountCompact, mountReview, stubFrame } from '../fixtures/reviewUi'
import { ANNA, BORIS, addEdgeD, addNodeD, moveB, renameA, reviewData, suggestion } from '../fixtures/reviewHarness'

const live = () => document.querySelector('.base-flow-map__sr[aria-live]') as HTMLElement
const card = (title: string) =>
	screen.getByRole('listitem', { name: formatMessage(UI_FLOW_REVIEW.SUGGESTION_ARIA, { title, name: ANNA.name }) })

beforeEach(() => stubFrame(1200))

describe('панель «Правки»', () => {
	it('вне режима «Правки» панели и панели фильтров нет', async () => {
		await mountReview({ mode: 'view', suggestions: [suggestion('s1', [renameA])] })
		expect(screen.queryByRole('region', { name: UI_FLOW_REVIEW.PANEL })).toBeNull()
		expect(screen.queryByRole('toolbar', { name: UI_FLOW_REVIEW.FILTERS })).toBeNull()
		expect(document.querySelectorAll('.base-flow-map__review-mark')).toHaveLength(0)
	})

	it('вкладки с числами: ждущие предложения, комментарии, версии', async () => {
		await mountReview({
			suggestions: [suggestion('s1', [renameA]), suggestion('s2', [moveB], { status: 'declined' })],
			comments: [{ id: 't1', comments: [{ id: 'c1', author: BORIS, text: 'Вопрос', date: 1 }] }],
		})
		const panel = screen.getByRole('region', { name: UI_FLOW_REVIEW.PANEL })
		const tabs = within(panel).getAllByRole('tab')
		expect(tabs.map(tab => tab.textContent?.trim())).toEqual([
			`${UI_FLOW_REVIEW.TAB_SUGGESTIONS} 1`,
			`${UI_FLOW_REVIEW.TAB_COMMENTS} 1`,
			`${UI_FLOW_REVIEW.TAB_VERSIONS} 0`,
		])
		expect(tabs[0]).toHaveAttribute('aria-selected', 'true')
	})

	it('в узком виде панель стоит под картой, а не в боковой колонке', async () => {
		await mountCompact({ suggestions: [suggestion('s1', [renameA])] })
		const panel = screen.getByRole('region', { name: UI_FLOW_REVIEW.PANEL })
		expect(panel.closest('.base-flow-map__side')).toBeNull()
		expect(document.querySelector('.base-flow-map__side')).toBeNull()
	})
})

describe('вкладка «Предложения»', () => {
	it('пусто — подсказка про черновик', async () => {
		await mountReview()
		expect(screen.getByText(UI_FLOW_REVIEW.EMPTY_SUGGESTIONS)).toBeInTheDocument()
		expect(screen.getByText(UI_FLOW_REVIEW.EMPTY_SUGGESTIONS_HINT)).toBeInTheDocument()
		expect(screen.queryByRole('button', { name: /Принять все/ })).toBeNull()
	})

	it('карточка: автор, вид, сводка, поля было → стало, действия', async () => {
		await mountReview({ suggestions: [suggestion('s1', [renameA])] })
		const item = card('Предложение s1')
		expect(within(item).getByText(ANNA.name)).toBeInTheDocument()
		expect(within(item).getByText(UI_FLOW_REVIEW.KIND_RENAME)).toBeInTheDocument()
		expect(within(item).getByText('~1 узел')).toBeInTheDocument()
		expect(within(item).getByText('Alpha').tagName).toBe('DEL')
		expect(within(item).getByText('Альфа').tagName).toBe('INS')
		expect(within(item).getByRole('button', { name: UI_FLOW_REVIEW.ACCEPT })).toBeEnabled()
		expect(within(item).getByRole('button', { name: UI_FLOW_REVIEW.DECLINE })).toBeInTheDocument()
	})

	it('стрелка «было → стало» несёт класс для зеркала RTL', async () => {
		await mountReview({ suggestions: [suggestion('s1', [renameA])] })
		const arrow = card('Предложение s1').querySelector('.base-flow-map__review-arrow')
		expect(arrow).toHaveAttribute('aria-hidden', 'true')
		expect(arrow).toHaveTextContent('→')
	})

	it('у предложения без подписи заголовок по умолчанию, у добавления нет строк полей', async () => {
		await mountReview({ suggestions: [suggestion('s1', [addNodeD], { label: undefined })] })
		const item = screen.getByRole('listitem', { name: formatMessage(UI_FLOW_REVIEW.SUGGESTION_ARIA, { title: '', name: ANNA.name }) })
		expect(within(item).getByText(UI_FLOW_REVIEW.SUGGESTION_UNTITLED)).toBeInTheDocument()
		expect(within(item).getByText(UI_FLOW_REVIEW.KIND_ADD)).toBeInTheDocument()
		expect(item.querySelector('.base-flow-map__review-fields')).toBeNull()
	})

	it('сводка пустая у предложения из одних полей корня', async () => {
		const root = { type: 'root' as const, patch: { title: 'B' }, previous: { title: 'A' } }
		await mountReview({ suggestions: [suggestion('s1', [root])] })
		expect(card('Предложение s1').querySelector('.base-flow-map__review-card-summary')).toBeNull()
	})

	it('показывает не больше трёх полей', async () => {
		const wide = { type: 'update' as const, entity: 'node' as const, id: 'a', patch: { a1: 1, a2: 2, a3: 3, a4: 4 }, previous: {} }
		await mountReview({ suggestions: [suggestion('s1', [wide])] })
		expect(card('Предложение s1').querySelectorAll('.base-flow-map__review-fields li')).toHaveLength(3)
	})

	it('«Принять» применяет предложение, карточка становится «Принято», озвучка в live-регионе', async () => {
		const user = userEvent.setup()
		const view = await mountReview({ suggestions: [suggestion('s1', [renameA, moveB])] })
		await user.click(within(card('Предложение s1')).getByRole('button', { name: UI_FLOW_REVIEW.ACCEPT }))
		await waitFor(() => expect(within(card('Предложение s1')).getByText(UI_FLOW_REVIEW.STATUS_ACCEPTED)).toBeInTheDocument())
		expect(view.controller.getData().nodes[0].label).toBe('Альфа')
		await waitFor(() => expect(live()).toHaveTextContent(formatMessage(UI_FLOW_REVIEW.ANNOUNCE_ACCEPTED, { label: 'Предложение s1' })))
		expect(fired(view, 'accept')).toHaveLength(1)
		expect(fired(view, 'update:suggestions').at(-1)?.[0]).toEqual([expect.objectContaining({ id: 's1', status: 'accepted' })])
		view.controller.undo()
		expect(view.controller.getData().nodes[0].label).toBe('Alpha')
		expect(view.controller.getHistory().canUndo).toBe(false)
	})

	it('«Отклонить» помечает карточку «Отклонено» и озвучивает', async () => {
		const user = userEvent.setup()
		const view = await mountReview({ suggestions: [suggestion('s1', [renameA])] })
		await user.click(within(card('Предложение s1')).getByRole('button', { name: UI_FLOW_REVIEW.DECLINE }))
		expect(within(card('Предложение s1')).getByText(UI_FLOW_REVIEW.STATUS_DECLINED)).toBeInTheDocument()
		await waitFor(() => expect(live()).toHaveTextContent(formatMessage(UI_FLOW_REVIEW.ANNOUNCE_DECLINED, { label: 'Предложение s1' })))
		expect(fired(view, 'decline')).toHaveLength(1)
		expect(screen.queryByRole('button', { name: UI_FLOW_REVIEW.ACCEPT })).toBeNull()
	})

	it('устаревшее предложение: «Принять» недоступна с причиной, фокус на кнопку встаёт', async () => {
		const user = userEvent.setup()
		const versions: FlowVersion[] = [
			{ id: 'v1', label: 'v1', date: 1000, data: reviewData() },
			{ id: 'v2', label: 'v2', date: 2000, data: reviewData() },
		]
		const view = await mountReview({ versions, suggestions: [suggestion('s1', [renameA], { baseVersion: 'v1' })] })
		const item = card('Предложение s1')
		const accept = within(item).getByRole('button', { name: UI_FLOW_REVIEW.ACCEPT })
		expect(within(item).getByText(UI_FLOW_REVIEW.STALE)).toBeInTheDocument()
		expect(accept).toHaveAttribute('aria-disabled', 'true')
		expect(accept).toHaveAccessibleDescription(UI_FLOW_REVIEW.STALE_REASON)
		await user.click(accept)
		accept.focus()
		expect(accept).toHaveFocus()
		expect(view.controller.getData().nodes[0].label).toBe('Alpha')
		expect(fired(view, 'accept')).toHaveLength(0)
		expect(screen.queryByRole('button', { name: /Принять все/ })).toBeNull()
	})

	it('«Принять все: N» принимает все ждущие и актуальные', async () => {
		const user = userEvent.setup()
		const view = await mountReview({
			suggestions: [suggestion('s1', [renameA], { date: 2000 }), suggestion('s2', [moveB], { date: 1000 })],
		})
		await user.click(screen.getByRole('button', { name: 'Принять все: 2' }))
		await waitFor(() => expect(fired(view, 'accept')).toHaveLength(2))
		expect(screen.queryByRole('button', { name: /Принять все/ })).toBeNull()
		expect(screen.getAllByText(UI_FLOW_REVIEW.STATUS_ACCEPTED, { selector: 'p' })).toHaveLength(2)
	})

	it('наведение и фокус на карточке подсвечивают её, уход снимает', async () => {
		const user = userEvent.setup()
		await mountReview({ suggestions: [suggestion('s1', [renameA]), suggestion('s2', [moveB])] })
		const item = card('Предложение s1')
		await user.hover(item)
		expect(item).toHaveClass('base-flow-map__review-card--hot')
		await user.unhover(item)
		expect(item).not.toHaveClass('base-flow-map__review-card--hot')
		await user.tab()
		const focusable = within(card('Предложение s2')).getByRole('button', { name: UI_FLOW_REVIEW.ACCEPT })
		focusable.focus()
		await waitFor(() => expect(card('Предложение s2')).toHaveClass('base-flow-map__review-card--hot'))
		focusable.blur()
		await waitFor(() => expect(card('Предложение s2')).not.toHaveClass('base-flow-map__review-card--hot'))
	})

	it('заголовок карточки показывает элемент на карте: фокус на нём', async () => {
		const user = userEvent.setup()
		const view = await mountReview({ suggestions: [suggestion('s1', [moveB]), suggestion('s2', [addNodeD, addEdgeD])] })
		await user.click(screen.getByRole('button', { name: 'Предложение s1' }))
		await waitFor(() => expect(fired(view, 'focus-change').at(-1)?.[0]).toMatchObject({ id: 'b' }))
	})

	it('заголовок карточки без видимых изменений ничего не делает', async () => {
		const user = userEvent.setup()
		const root = { type: 'root' as const, patch: { title: 'B' }, previous: { title: 'A' } }
		const view = await mountReview({ suggestions: [suggestion('s1', [root])] })
		await user.click(screen.getByRole('button', { name: 'Предложение s1' }))
		expect(fired(view, 'focus-change')).toHaveLength(0)
	})

	it('фокус на карточке приглушает остальные элементы карты', async () => {
		const user = userEvent.setup()
		await mountReview({ suggestions: [suggestion('s1', [renameA])] })
		await user.hover(card('Предложение s1'))
		await waitFor(() => expect(document.querySelector('.base-flow-map__review-mark--hot')).not.toBeNull())
	})
})
