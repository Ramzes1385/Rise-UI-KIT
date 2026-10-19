import '@testing-library/jest-dom/vitest'
import { formatMessage } from '@/locales/state'
import userEvent from '@testing-library/user-event'
import { screen, waitFor, within } from '@testing-library/vue'
import { ANNA, BORIS, reviewData } from '../../fixtures/reviewHarness'
import { UI_COMMENT_THREAD, UI_FLOW_REVIEW } from '@/locales/messages'
import { fired, mountReview, stubFrame } from '../../fixtures/reviewUi'
import type { FlowCommentThread } from '../../../../types/data/flowReview.types'

const thread = (id: string, extra: Partial<FlowCommentThread> = {}): FlowCommentThread => ({
	id,
	target: { entity: 'node', id: 'a' },
	comments: [{ id: `c-${id}`, author: BORIS, text: `Текст ${id}`, date: 1 }],
	...extra,
})

const pinName = (name: string, count: number) => formatMessage(UI_FLOW_REVIEW.PIN_LABEL, { name, count })

beforeEach(() => stubFrame(1200))

describe('булавки комментариев', () => {
	it('вне режима «Правки» булавок нет', () => {
		mountReview({ mode: 'view', comments: [thread('t1')] })
		expect(screen.queryByRole('button', { name: pinName(BORIS.name, 1) })).toBeNull()
	})

	it('булавка — кнопка с подписью: кто начал и сколько комментариев; на ней инициалы и число', () => {
		mountReview({ comments: [thread('t1')] })
		const pin = screen.getByRole('button', { name: pinName(BORIS.name, 1) })
		expect(pin).toHaveTextContent('Б')
		expect(pin).toHaveTextContent('1')
		expect(pin).not.toHaveClass('base-flow-map__review-pin--unread')
	})

	it('положение следует за масштабом и сдвигом: правый верхний угол узла', () => {
		const view = mountReview({ comments: [thread('t1')] })
		view.controller.setViewport({ x: 10, y: 20, zoom: 2 })
		return waitFor(() => {
			const pin = screen.getByRole('button', { name: pinName(BORIS.name, 1) })
			expect(pin.style.insetInlineStart).toBe('330px')
			expect(pin.style.insetBlockStart).toBe('20px')
		})
	})

	it('непрочитанная пульсирует, решённая гаснет и показывает галочку вместо числа', () => {
		mountReview({
			comments: [thread('t1', { isUnread: true }), thread('t2', { isResolved: true, target: { entity: 'node', id: 'b' } })],
		})
		const [unread, done] = screen.getAllByRole('button', { name: pinName(BORIS.name, 1) })
		expect(unread).toHaveClass('base-flow-map__review-pin--unread')
		expect(done).toHaveClass('base-flow-map__review-pin--done')
		expect(done).not.toHaveTextContent('1')
	})

	it('к связи, группе и точке холста булавки тоже ставятся; к чужому элементу — нет', () => {
		const data = reviewData({
			groups: [{ id: 'g', kind: 'zone', label: 'Зона' }],
			nodes: reviewData().nodes.map(node => (node.id === 'a' ? { ...node, group: 'g' } : node)),
		})
		mountReview({
			data,
			comments: [
				thread('t1', { target: { entity: 'edge', id: 'e1' } }),
				thread('t2', { target: { entity: 'group', id: 'g' } }),
				thread('t3', { target: undefined, point: { x: 40, y: 50 } }),
				thread('t4', { target: { entity: 'node', id: 'нет' } }),
				thread('t5', { target: undefined }),
			],
		})
		expect(screen.getAllByRole('button', { name: pinName(BORIS.name, 1) })).toHaveLength(3)
	})

	it('цепочка без комментариев: булавка без инициалов', () => {
		mountReview({ comments: [thread('t1', { comments: [] })] })
		expect(screen.getByRole('button', { name: pinName('', 0) })).toBeInTheDocument()
	})

	it('с клавиатуры: Enter открывает цепочку, Escape закрывает, фокус возвращается', async () => {
		const user = userEvent.setup()
		mountReview({ comments: [thread('t1', { isUnread: true })] })
		const pin = screen.getByRole('button', { name: pinName(BORIS.name, 1) })
		await user.tab()
		pin.focus()
		await user.keyboard('{Enter}')
		const dialog = await screen.findByRole('region', { name: formatMessage(UI_FLOW_REVIEW.THREAD, { count: 1 }) })
		expect(within(dialog).getByText('Текст t1')).toBeInTheDocument()
		await user.keyboard('{Escape}')
		await waitFor(() => expect(screen.queryByRole('region', { name: formatMessage(UI_FLOW_REVIEW.THREAD, { count: 1 }) })).toBeNull())
		expect(pin).toHaveFocus()
	})

	it('открытие помечает цепочку прочитанной', async () => {
		const user = userEvent.setup()
		const view = mountReview({ comments: [thread('t1', { isUnread: true })] })
		await user.click(screen.getByRole('button', { name: pinName(BORIS.name, 1) }))
		await screen.findByRole('region', { name: formatMessage(UI_FLOW_REVIEW.THREAD, { count: 1 }) })
		expect((fired(view, 'update:comments').at(-1)?.[0] as FlowCommentThread[])[0].isUnread).toBe(false)
	})

	it('ответ из окна цепочки уходит событиями update:comments и comment', async () => {
		const user = userEvent.setup()
		const view = mountReview({ comments: [thread('t1')] })
		await user.click(screen.getByRole('button', { name: pinName(BORIS.name, 1) }))
		const dialog = await screen.findByRole('region', { name: formatMessage(UI_FLOW_REVIEW.THREAD, { count: 1 }) })
		await user.type(within(dialog).getByRole('textbox', { name: UI_COMMENT_THREAD.NEW }), 'Ответ{Enter}')
		await user.click(within(dialog).getByRole('button', { name: UI_COMMENT_THREAD.SEND }))
		await waitFor(() => expect(fired(view, 'comment').length).toBeGreaterThan(0))
		const event = fired(view, 'comment').at(-1)?.[0] as { action: string; thread: FlowCommentThread }
		expect(event.action).toBe('reply')
		expect(event.thread.comments.at(-1)).toMatchObject({ text: 'Ответ', author: ANNA })
	})

	it('«Решено» в окне решает цепочку, потом предлагает «Вернуть»', async () => {
		const user = userEvent.setup()
		const view = mountReview({ comments: [thread('t1')] })
		await user.click(screen.getByRole('button', { name: pinName(BORIS.name, 1) }))
		await user.click(await screen.findByRole('button', { name: UI_FLOW_REVIEW.RESOLVE }))
		expect(await screen.findByRole('button', { name: UI_FLOW_REVIEW.REOPEN })).toBeInTheDocument()
		expect((fired(view, 'comment').at(-1)?.[0] as { action: string }).action).toBe('resolve')
		await user.click(screen.getByRole('button', { name: UI_FLOW_REVIEW.REOPEN }))
		expect((fired(view, 'comment').at(-1)?.[0] as { action: string }).action).toBe('reopen')
	})

	it('решённые булавки скрываются переключателем «Показывать решённые» на вкладке комментариев', async () => {
		const user = userEvent.setup()
		mountReview({ comments: [thread('t1', { isResolved: true })] })
		expect(screen.getByRole('button', { name: pinName(BORIS.name, 1) })).toBeInTheDocument()
		await user.click(screen.getByRole('tab', { name: new RegExp(UI_FLOW_REVIEW.TAB_COMMENTS) }))
		await user.click(screen.getByRole('switch', { name: UI_FLOW_REVIEW.SHOW_RESOLVED }))
		expect(screen.queryByRole('button', { name: pinName(BORIS.name, 1) })).toBeNull()
	})
})
