import '@testing-library/jest-dom/vitest'
import BaseCommentThread from '../ui/BaseCommentThread.vue'
import type { CommentItem } from '../types/BaseCommentThread.types'
import { fireEvent, render, screen, within } from '@testing-library/vue'

const NOW = new Date(2025, 4, 15, 10, 30)
const anna = { name: 'Анна Смирнова', avatar: 'data:image/png;base64,AA' }
const ivan = { name: 'Иван Петров' }

const COMMENTS: CommentItem[] = [
	{
		id: 'c1',
		author: anna,
		text: 'Первый',
		date: new Date(2025, 4, 15, 10, 25),
		likes: 2,
		isLiked: true,
		replies: [
			{
				id: 'c2',
				author: ivan,
				text: 'Ответ',
				date: new Date(2025, 4, 15, 10, 0),
				replies: [{ id: 'c3', author: anna, text: 'Ответ на ответ', date: NOW }],
			},
		],
	},
	{ id: 'c4', author: ivan, text: 'Строка 1\nСтрока 2', date: new Date(2025, 4, 14, 9, 0) },
]

const renderThread = (props: Record<string, unknown> = {}) =>
	render(BaseCommentThread, { props: { comments: COMMENTS, now: NOW, ...props } })

describe('BaseCommentThread unit', () => {
	it('область «Комментарии», число комментариев, статьи с именами авторов и относительное время', () => {
		const { container } = renderThread()
		expect(screen.getByRole('region', { name: 'Комментарии' })).toBeInTheDocument()
		expect(screen.getByText('4 комментария')).toBeInTheDocument()
		expect(screen.getAllByRole('article', { name: 'Анна Смирнова' })).toHaveLength(2)
		expect(screen.getByText('5 минут назад')).toBeInTheDocument()
		expect(container.querySelector('time')).toHaveAttribute('datetime', new Date(COMMENTS[0].date).toISOString())
	})

	it('«Нравится»: счётчик, нажатое состояние и событие like', async () => {
		const { emitted } = renderThread()
		const liked = screen.getByRole('button', { name: 'Нравится · 2' })
		expect(liked).toHaveAttribute('aria-pressed', 'true')
		await fireEvent.click(liked)
		const [plain] = screen.getAllByRole('button', { name: 'Нравится' })
		expect(plain).toHaveAttribute('aria-pressed', 'false')
		await fireEvent.click(plain)
		expect(emitted().like).toEqual([[{ id: 'c1', isLiked: false }], [{ id: 'c2', isLiked: true }]])
	})

	it('«Ответить» открывает поле с фокусом; Ctrl+Enter отправляет, фокус возвращается на «Ответить»', async () => {
		const { emitted } = renderThread()
		const reply = screen.getAllByRole('button', { name: 'Ответить' })[3]
		await fireEvent.click(reply)
		expect(reply).toHaveAttribute('aria-expanded', 'true')
		const field = screen.getByRole('textbox', { name: 'Ответ пользователю Иван Петров' })
		expect(field).toHaveFocus()
		await fireEvent.update(field, '  Спасибо  ')
		await fireEvent.keyDown(field, { key: 'Enter', ctrlKey: true })
		expect(emitted().reply).toEqual([[{ parentId: 'c4', text: 'Спасибо' }]])
		expect(screen.queryByRole('textbox', { name: 'Ответ пользователю Иван Петров' })).not.toBeInTheDocument()
		await Promise.resolve()
		expect(reply).toHaveFocus()
	})

	it('Escape и «Отмена» закрывают ответ без события; пустой ответ не отправляется', async () => {
		const { emitted } = renderThread()
		const reply = screen.getAllByRole('button', { name: 'Ответить' })[0]
		await fireEvent.click(reply)
		const field = screen.getByRole('textbox', { name: 'Ответ пользователю Анна Смирнова' })
		await fireEvent.keyDown(field, { key: 'Enter', metaKey: true })
		await fireEvent.keyDown(field, { key: 'Enter' })
		await fireEvent.keyDown(field, { key: 'Escape' })
		expect(screen.queryByRole('textbox', { name: 'Ответ пользователю Анна Смирнова' })).not.toBeInTheDocument()
		await fireEvent.click(reply)
		await fireEvent.click(screen.getByRole('button', { name: 'Отмена' }))
		expect(screen.queryByRole('button', { name: 'Отмена' })).not.toBeInTheDocument()
		expect(emitted().reply).toBeUndefined()
	})

	it('новый комментарий в ветку: кнопка «Отправить» доступна с текстом, поле очищается', async () => {
		const { emitted } = renderThread({ currentUser: anna })
		const field = screen.getByRole('textbox', { name: 'Новый комментарий' })
		const send = screen.getAllByRole('button', { name: 'Отправить' }).at(-1) as HTMLElement
		expect(send).toBeDisabled()
		await fireEvent.update(field, 'Новый')
		expect(send).toBeEnabled()
		await fireEvent.click(send)
		expect(emitted().reply).toEqual([[{ parentId: null, text: 'Новый' }]])
		expect(field).toHaveValue('')
		expect(field).toHaveFocus()
		await fireEvent.keyDown(field, { key: 'Escape' })
		expect(field).toBeInTheDocument()
	})

	it('ответы сворачиваются: «Скрыть ответы» ↔ «Показать 2 ответа»', async () => {
		renderThread()
		const toggle = screen.getAllByRole('button', { name: 'Скрыть ответы' })[0]
		const list = document.getElementById(toggle.getAttribute('aria-controls') as string) as HTMLElement
		await fireEvent.click(toggle)
		expect(toggle).toHaveTextContent('Показать 2 ответа')
		expect(toggle).toHaveAttribute('aria-expanded', 'false')
		expect(list).not.toBeVisible()
		await fireEvent.click(toggle)
		expect(list).toBeVisible()
	})

	it('глубже maxDepth — без нового отступа, но с автором комментария, на который ответили', () => {
		const { container } = renderThread({ maxDepth: 2 })
		const lists = container.querySelectorAll('.base-comment-thread__replies')
		expect(lists[0]).not.toHaveClass('base-comment-thread__replies--flat')
		expect(lists[1]).toHaveClass('base-comment-thread__replies--flat')
		const replyTo = container.querySelectorAll('.base-comment-thread__reply-to')
		expect(replyTo).toHaveLength(1)
		expect(replyTo[0]).toHaveTextContent('в ответ пользователю Иван Петров')
		expect(lists[1].querySelector('.base-comment-thread__reply-to')).toBe(replyTo[0])
	})

	it('в пределах maxDepth автор родителя не повторяется: его видно по отступу', () => {
		const { container } = renderThread()
		expect(container.querySelector('.base-comment-thread__reply-to')).toBeNull()
	})

	it('только чтение: без «Ответить» и поля; пустая ветка', () => {
		renderThread({ isReadonly: true, comments: [] })
		expect(screen.getByText('Комментариев пока нет')).toBeInTheDocument()
		expect(screen.getByText('0 комментариев')).toBeInTheDocument()
		expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
	})

	it('свой label, вариант, customClass и аватар текущего пользователя', () => {
		const { container } = renderThread({ label: 'Обсуждение', variant: 'ghost', currentUser: anna, customClass: { root: 'my-root' } })
		expect(screen.getByRole('region', { name: 'Обсуждение' })).toHaveClass('base-comment-thread--ghost', 'my-root')
		const composer = container.querySelector('form:last-of-type') as HTMLElement
		expect(within(composer).getByRole('textbox')).toBeInTheDocument()
		expect(composer.querySelector('.base-comment-thread__avatar img')).toHaveAttribute('src', anna.avatar)
	})
})
