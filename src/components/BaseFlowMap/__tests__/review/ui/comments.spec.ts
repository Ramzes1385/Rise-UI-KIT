import '@testing-library/jest-dom/vitest'
import { formatMessage } from '@/locales/state'
import { BORIS } from '../fixtures/reviewHarness'
import userEvent from '@testing-library/user-event'
import { screen, waitFor, within } from '@testing-library/vue'
import { UI_COMMENT_THREAD, UI_FLOW_REVIEW } from '@/locales/messages'
import type { FlowCommentThread } from '../../../types/data/flowReview.types'
import { fired, mountCompact, mountReview, stubFrame } from '../fixtures/reviewUi'

const thread = (id: string, extra: Partial<FlowCommentThread> = {}): FlowCommentThread => ({
	id,
	target: { entity: 'node', id: 'a' },
	comments: [{ id: `c-${id}`, author: BORIS, text: `Текст ${id}`, date: Date.now() - 60_000 }],
	...extra,
})

async function openComments(user: ReturnType<typeof userEvent.setup>) {
	await user.click(screen.getByRole('tab', { name: new RegExp(UI_FLOW_REVIEW.TAB_COMMENTS) }))
}

beforeEach(() => stubFrame(1200))

describe('вкладка «Комментарии»', () => {
	it('пусто: подсказка выбрать элемент и пустое состояние', async () => {
		const user = userEvent.setup()
		mountReview()
		await openComments(user)
		expect(screen.getByText(UI_FLOW_REVIEW.COMMENT_HINT)).toBeInTheDocument()
		expect(screen.getByText(UI_FLOW_REVIEW.EMPTY_COMMENTS)).toBeInTheDocument()
		expect(screen.queryByRole('textbox')).toBeNull()
	})

	it('без текущего пользователя комментировать нельзя даже с выбранным элементом', async () => {
		const user = userEvent.setup()
		const view = mountReview({ currentUser: undefined })
		await openComments(user)
		view.controller.select(['a'])
		await waitFor(() => expect(screen.getByText(UI_FLOW_REVIEW.COMMENT_HINT)).toBeInTheDocument())
		expect(screen.queryByRole('textbox')).toBeNull()
	})

	it('выбран узел: поле «Комментарий к «Alpha»», кнопка неактивна, пока поле пусто', async () => {
		const user = userEvent.setup()
		const view = mountReview()
		await openComments(user)
		view.controller.select(['a'])
		const input = await screen.findByRole('textbox', { name: formatMessage(UI_FLOW_REVIEW.COMMENT_ON, { name: 'Alpha' }) })
		const send = screen.getByRole('button', { name: UI_FLOW_REVIEW.COMMENT_SEND })
		expect(send).toBeDisabled()
		await user.type(input, '   ')
		expect(send).toBeDisabled()
		await user.type(input, 'Почему так?')
		expect(send).toBeEnabled()
	})

	it('отправка создаёт цепочку, чистит поле, шлёт update:comments и comment', async () => {
		const user = userEvent.setup()
		const view = mountReview()
		await openComments(user)
		view.controller.select(['e1'])
		const input = await screen.findByRole('textbox', { name: formatMessage(UI_FLOW_REVIEW.COMMENT_ON, { name: 'заказ' }) })
		await user.type(input, 'Нужна очередь{Enter}')
		expect(input).toHaveValue('')
		expect(fired(view, 'update:comments')).toHaveLength(1)
		const event = fired(view, 'comment')[0][0] as { action: string; thread: FlowCommentThread }
		expect(event.action).toBe('add')
		expect(event.thread.target).toEqual({ entity: 'edge', id: 'e1' })
		expect(document.querySelector('.base-flow-map__review-card-summary')).toHaveTextContent('Нужна очередь')
		expect(screen.getByRole('tab', { name: `${UI_FLOW_REVIEW.TAB_COMMENTS} 1` })).toBeInTheDocument()
	})

	it('отправка пустого поля Enter-ом не создаёт цепочку', async () => {
		const user = userEvent.setup()
		const view = mountReview()
		await openComments(user)
		view.controller.select(['a'])
		const input = await screen.findByRole('textbox')
		await user.type(input, '{Enter}')
		expect(fired(view, 'update:comments')).toHaveLength(0)
	})

	it('комментарий к группе: имя группы в подписи поля', async () => {
		const user = userEvent.setup()
		const view = mountReview({
			data: {
				version: 1,
				nodes: [{ id: 'a', kind: 'service', label: 'Alpha', position: { x: 0, y: 0 }, isPinned: true }],
				edges: [],
				groups: [{ id: 'g', kind: 'zone', label: 'Зона', nodes: ['a'] } as never],
			},
		})
		await openComments(user)
		view.controller.select(['g'])
		expect(await screen.findByRole('textbox', { name: formatMessage(UI_FLOW_REVIEW.COMMENT_ON, { name: 'Зона' }) })).toBeInTheDocument()
	})

	it('карточка: адресат, последний текст, статус «новое / открыто / решено», число решённых скрывается переключателем', async () => {
		const user = userEvent.setup()
		mountReview({
			comments: [
				thread('t1', { isUnread: true }),
				thread('t2', { target: undefined, point: { x: 5, y: 5 } }),
				thread('t3', { isResolved: true, target: { entity: 'edge', id: 'e1' } }),
			],
		})
		await openComments(user)
		const items = screen.getAllByRole('listitem').filter(item => item.classList.contains('base-flow-map__review-card'))
		expect(items).toHaveLength(3)
		expect(within(items[0]).getByText('Alpha')).toBeInTheDocument()
		expect(within(items[0]).getByText(UI_FLOW_REVIEW.THREAD_NEW)).toBeInTheDocument()
		expect(within(items[1]).getByText(UI_FLOW_REVIEW.THREAD_POINT)).toBeInTheDocument()
		expect(within(items[1]).getByText(UI_FLOW_REVIEW.THREAD_OPEN)).toBeInTheDocument()
		expect(within(items[2]).getByText(UI_FLOW_REVIEW.THREAD_RESOLVED)).toBeInTheDocument()
		await user.click(screen.getByRole('switch', { name: UI_FLOW_REVIEW.SHOW_RESOLVED }))
		expect(screen.queryByText(UI_FLOW_REVIEW.THREAD_RESOLVED)).toBeNull()
	})

	it('«Решено» и «Вернуть» меняют состояние цепочки и шлют comment', async () => {
		const user = userEvent.setup()
		const view = mountReview({ comments: [thread('t1')] })
		await openComments(user)
		await user.click(screen.getByRole('button', { name: UI_FLOW_REVIEW.RESOLVE }))
		expect(await screen.findByRole('button', { name: UI_FLOW_REVIEW.REOPEN })).toBeInTheDocument()
		await user.click(screen.getByRole('button', { name: UI_FLOW_REVIEW.REOPEN }))
		expect((fired(view, 'comment') as [{ action: string }][]).map(item => item[0].action)).toEqual(['resolve', 'reopen'])
	})

	it('«Показать» ведёт к элементу цепочки; у точки на холсте элемента нет', async () => {
		const user = userEvent.setup()
		const view = mountReview({ comments: [thread('t1'), thread('t2', { target: undefined, point: { x: 1, y: 1 } })] })
		await openComments(user)
		const buttons = screen.getAllByRole('button', { name: UI_FLOW_REVIEW.SHOW_ELEMENT })
		await user.click(buttons[1])
		expect(fired(view, 'focus-change')).toHaveLength(0)
		await user.click(buttons[0])
		await waitFor(() => expect(fired(view, 'focus-change').at(-1)?.[0]).toMatchObject({ id: 'a' }))
	})

	it('в широком виде заголовок раскрывает цепочку и помечает её прочитанной', async () => {
		const user = userEvent.setup()
		const view = mountReview({ comments: [thread('t1', { isUnread: true })] })
		await openComments(user)
		const title = screen.getByRole('button', { name: 'Alpha' })
		expect(title).toHaveAttribute('aria-expanded', 'false')
		await user.click(title)
		expect(title).toHaveAttribute('aria-expanded', 'true')
		expect(screen.getByText(UI_FLOW_REVIEW.THREAD_OPEN)).toBeInTheDocument()
		expect(fired(view, 'update:comments')).toHaveLength(1)
		expect(document.querySelector('.base-flow-map__review-card .base-flow-map__review-thread')).toBeNull()
	})

	it('в узком виде открытая цепочка раскрывается в карточке, ответ уходит событием', async () => {
		const user = userEvent.setup()
		const view = await mountCompact({ comments: [thread('t1')] })
		await openComments(user)
		await user.click(screen.getByRole('button', { name: 'Alpha' }))
		const inline = document.querySelector('.base-flow-map__review-card .base-flow-map__review-thread') as HTMLElement
		expect(inline).not.toBeNull()
		expect(within(inline).getByText('Текст t1')).toBeInTheDocument()
		within(inline).getByRole('textbox', { name: UI_COMMENT_THREAD.NEW }).focus()
		await user.keyboard('Согласен{Control>}{Enter}{/Control}')
		await waitFor(() => expect((fired(view, 'comment').at(-1)?.[0] as { action: string }).action).toBe('reply'))
	})

	it('строка состояния: число и непрочитанные', async () => {
		mountReview({ comments: [thread('t1', { isUnread: true }), thread('t2')] })
		const status = screen.getAllByRole('status').find(item => item.classList.contains('base-flow-map__review-status')) as HTMLElement
		expect(status).toHaveTextContent(`${UI_FLOW_REVIEW.STATUS_COMMENTS}: 2`)
		expect(status).toHaveTextContent('1 непрочитанная')
	})

	it('если всё прочитано, об этом сказано', () => {
		mountReview({ comments: [thread('t1')] })
		const status = screen.getAllByRole('status').find(item => item.classList.contains('base-flow-map__review-status')) as HTMLElement
		expect(status).toHaveTextContent(UI_FLOW_REVIEW.ALL_READ)
	})
})
