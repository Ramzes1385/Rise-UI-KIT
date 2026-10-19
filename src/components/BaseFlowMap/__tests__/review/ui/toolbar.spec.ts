import '@testing-library/jest-dom/vitest'
import { formatMessage } from '@/locales/state'
import { UI_FLOW_REVIEW } from '@/locales/messages'
import userEvent from '@testing-library/user-event'
import { screen, waitFor, within } from '@testing-library/vue'
import { fired, mountReview, stubFrame } from '../fixtures/reviewUi'
import { ANNA, BORIS, moveB, renameA, suggestion } from '../fixtures/reviewHarness'

beforeEach(() => stubFrame(1200))

const toolbar = () => screen.getByRole('toolbar', { name: UI_FLOW_REVIEW.FILTERS })
const titles = () => screen.queryAllByRole('listitem', { name: /Предложение:/ }).map(item => item.getAttribute('aria-label'))

describe('панель фильтров', () => {
	it('легенда: добавлено, удалено, переименовано, перемещено, комментарий', () => {
		mountReview()
		const legend = screen.getByRole('list', { name: UI_FLOW_REVIEW.LEGEND })
		expect(
			within(legend)
				.getAllByRole('listitem')
				.map(item => item.textContent?.trim()),
		).toEqual([
			UI_FLOW_REVIEW.LEGEND_ADD,
			UI_FLOW_REVIEW.LEGEND_REMOVE,
			UI_FLOW_REVIEW.LEGEND_RENAME,
			UI_FLOW_REVIEW.LEGEND_MOVE,
			UI_FLOW_REVIEW.LEGEND_COMMENT,
		])
	})

	it('без предложений группы авторов нет', () => {
		mountReview()
		expect(within(toolbar()).queryByRole('group', { name: UI_FLOW_REVIEW.AUTHORS })).toBeNull()
	})

	it('авторы: кнопки с aria-pressed скрывают и возвращают предложения автора', async () => {
		const user = userEvent.setup()
		mountReview({ suggestions: [suggestion('s1', [renameA]), suggestion('s2', [moveB], { author: BORIS })] })
		const shown = screen.getByRole('button', { name: formatMessage(UI_FLOW_REVIEW.AUTHOR_SHOWN, { name: BORIS.name }) })
		expect(shown).toHaveAttribute('aria-pressed', 'true')
		await user.click(shown)
		const hidden = screen.getByRole('button', { name: formatMessage(UI_FLOW_REVIEW.AUTHOR_HIDDEN, { name: BORIS.name }) })
		expect(hidden).toHaveAttribute('aria-pressed', 'false')
		expect(titles()).toHaveLength(1)
		await user.click(hidden)
		expect(titles()).toHaveLength(2)
	})

	it('аватары авторов и карточек предложений уменьшены до 75 %', () => {
		mountReview({ suggestions: [suggestion('s1', [renameA]), suggestion('s2', [moveB], { author: BORIS })] })
		const inToolbar = within(toolbar()).getByRole('group', { name: UI_FLOW_REVIEW.AUTHORS }).querySelectorAll('.base-avatar')
		const inCards = document.querySelectorAll('.base-flow-map__review-card-head .base-avatar')
		expect(inToolbar).toHaveLength(2)
		expect(inCards).toHaveLength(2)
		for (const avatar of [...inToolbar, ...inCards]) expect((avatar as HTMLElement).style.getPropertyValue('--size-scale')).toBe('0.75')
	})

	it('«Только мои» и «Неразрешённые» сужают список, «Всё» возвращает', async () => {
		const user = userEvent.setup()
		mountReview({
			suggestions: [
				suggestion('s1', [renameA]),
				suggestion('s2', [moveB], { author: BORIS }),
				suggestion('s3', [renameA], { status: 'accepted' }),
			],
		})
		expect(titles()).toHaveLength(3)
		await user.click(screen.getByRole('radio', { name: UI_FLOW_REVIEW.SHOW_MINE }))
		expect(titles()).toHaveLength(2)
		await user.click(screen.getByRole('radio', { name: UI_FLOW_REVIEW.SHOW_OPEN }))
		expect(titles()).toHaveLength(2)
		await user.click(screen.getByRole('radio', { name: UI_FLOW_REVIEW.SHOW_ALL }))
		expect(titles()).toHaveLength(3)
	})

	it('«Только изменения» включается и приглушает остальное', async () => {
		const user = userEvent.setup()
		mountReview({ suggestions: [suggestion('s1', [renameA])] })
		const only = screen.getByRole('switch', { name: UI_FLOW_REVIEW.ONLY_CHANGED })
		expect(only).not.toBeChecked()
		await user.click(only)
		expect(only).toBeChecked()
	})
})

describe('черновик', () => {
	it('кнопок отправки нет, пока черновик пуст', () => {
		mountReview()
		expect(screen.queryByRole('button', { name: UI_FLOW_REVIEW.DISCARD })).toBeNull()
	})

	it('правка попадает в черновик: «Отправить N предложений» отправляет, метки рисуются', async () => {
		const user = userEvent.setup()
		const view = mountReview()
		await view.controller.updateNode('a', { label: 'Новое' })
		await view.controller.updateNode('c', { label: 'Гамма' })
		expect(view.controller.getData().nodes[0].label).toBe('Alpha')
		const send = await screen.findByRole('button', { name: 'Отправить 2 предложения' })
		expect(document.querySelectorAll('.base-flow-map__review-mark--rename')).toHaveLength(2)
		await user.click(send)
		expect(fired(view, 'update:suggestions').at(-1)?.[0]).toHaveLength(2)
		expect(screen.queryByRole('button', { name: UI_FLOW_REVIEW.DISCARD })).toBeNull()
		expect(screen.getAllByRole('listitem', { name: /Предложение:/ })).toHaveLength(2)
		await waitFor(() =>
			expect(document.querySelector('.base-flow-map__sr[aria-live]')).toHaveTextContent(
				formatMessage(UI_FLOW_REVIEW.ANNOUNCE_SENT, { count: 2 }),
			),
		)
		expect(within(toolbar()).queryByRole('button', { name: /Отправить/ })).toBeNull()
	})

	it('«Сбросить» убирает черновик и метки', async () => {
		const user = userEvent.setup()
		const view = mountReview()
		await view.controller.updateNode('a', { label: 'Новое' })
		await user.click(await screen.findByRole('button', { name: UI_FLOW_REVIEW.DISCARD }))
		expect(screen.queryByRole('button', { name: /Отправить/ })).toBeNull()
		await waitFor(() => expect(document.querySelectorAll('.base-flow-map__review-mark')).toHaveLength(0))
	})

	it('текущий пользователь подписан на метках черновика', async () => {
		const view = mountReview()
		await view.controller.updateNode('a', { label: 'Новое' })
		await screen.findByRole('button', { name: /Отправить/ })
		expect(document.querySelector('.base-flow-map__review-author')).toHaveTextContent(ANNA.name)
	})
})
