import '@testing-library/jest-dom/vitest'
import BaseAiMessage from '../ui/BaseAiMessage.vue'
import { fireEvent, render, screen, waitFor } from '@testing-library/vue'

const mockClipboard = (writeText: (text: string) => Promise<void>) =>
	Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } })

describe('BaseAiMessage', () => {
	afterEach(() => {
		Reflect.deleteProperty(navigator, 'clipboard')
		vi.useRealTimers()
	})

	it('рендерит ответ через BaseMarkdown, имя, время и значок вместо аватара', () => {
		const { container } = render(BaseAiMessage, { props: { content: 'Ответ **жирным**', time: '12:04' } })

		const message = screen.getByRole('article', { name: 'Ассистент' })
		expect(message).not.toHaveAttribute('aria-busy')
		expect(message.querySelector('.base-markdown--ghost strong')).toHaveTextContent('жирным')
		expect(container.querySelector('time')).toHaveTextContent('12:04')
		expect(container.querySelector('.base-ai-message__avatar .base-icon')).toBeInTheDocument()
		expect(screen.getByRole('status')).toBeEmptyDOMElement()
	})

	it('своё имя и аватар-картинка', () => {
		const { container } = render(BaseAiMessage, { props: { content: 'Привет', name: 'Rise', avatar: '/bot.png' } })

		expect(screen.getByRole('article', { name: 'Rise' })).toBeInTheDocument()
		expect(container.querySelector('.base-ai-message__avatar-image')).toHaveAttribute('src', '/bot.png')
		expect(container.querySelector('.base-ai-message__avatar .base-icon')).toBeNull()
	})

	it('потоковый ответ: aria-busy, статус для скринридера, точки до первого текста, действия скрыты', async () => {
		const { container, rerender } = render(BaseAiMessage, { props: { isStreaming: true } })

		expect(screen.getByRole('article')).toHaveAttribute('aria-busy', 'true')
		expect(screen.getByRole('status')).toHaveTextContent('Ассистент отвечает')
		expect(container.querySelector('.base-ai-message__typing')).toHaveAttribute('aria-hidden', 'true')
		expect(container.querySelector('.base-ai-message__actions')).toBeNull()
		await rerender({ content: 'Час', isStreaming: true })
		expect(container.querySelector('.base-ai-message__typing')).toBeNull()
		expect(container.querySelector('.base-markdown__caret')).toBeInTheDocument()
		await rerender({ content: 'Часть', isStreaming: false })
		expect(screen.getByRole('button', { name: 'Копировать ответ' })).toBeInTheDocument()
	})

	it('без текста и без потока — ни точек, ни ответа', () => {
		const { container } = render(BaseAiMessage)

		expect(container.querySelector('.base-ai-message__typing')).toBeNull()
		expect(container.querySelector('.base-markdown')).toBeNull()
		expect(screen.queryByRole('button', { name: 'Копировать ответ' })).toBeNull()
	})

	it('ошибка: сообщение в role=alert и «Повторить» — событие retry', async () => {
		const { container, emitted } = render(BaseAiMessage, { props: { error: 'Сервер недоступен' } })

		expect(screen.getByRole('alert')).toHaveTextContent('Сервер недоступен')
		expect(container.querySelector('.base-ai-message')).toHaveClass('base-ai-message--error')
		await fireEvent.click(screen.getByRole('button', { name: 'Повторить' }))
		expect(emitted('retry')).toHaveLength(1)
	})

	it('копирует Markdown ответа, сообщает событием copy и на 2 с меняет подпись', async () => {
		vi.useFakeTimers()
		const writeText = vi.fn(async (_text: string) => undefined)
		mockClipboard(writeText)
		const { emitted } = render(BaseAiMessage, { props: { content: 'Код: `x`' } })

		await fireEvent.click(screen.getByRole('button', { name: 'Копировать ответ' }))
		await vi.waitFor(() => expect(screen.getByRole('button', { name: 'Скопировано' })).toBeInTheDocument())
		expect(writeText).toHaveBeenCalledWith('Код: `x`')
		expect(emitted('copy')).toEqual([['Код: `x`']])
		await fireEvent.click(screen.getByRole('button', { name: 'Скопировано' }))
		await vi.advanceTimersByTimeAsync(2000)
		expect(screen.getByRole('button', { name: 'Копировать ответ' })).toBeInTheDocument()
	})

	it('без буфера обмена или при отказе — подпись и событие не меняются', async () => {
		const { emitted } = render(BaseAiMessage, { props: { content: 'Ответ' } })

		await fireEvent.click(screen.getByRole('button', { name: 'Копировать ответ' }))
		mockClipboard(async () => Promise.reject(new Error('denied')))
		await fireEvent.click(screen.getByRole('button', { name: 'Копировать ответ' }))
		await waitFor(() => expect(screen.getByRole('button', { name: 'Копировать ответ' })).toBeInTheDocument())
		expect(emitted('copy')).toBeUndefined()
	})

	it('has-copy=false убирает кнопку; слот actions остаётся', () => {
		render(BaseAiMessage, {
			props: { content: 'Ответ', hasCopy: false },
			slots: { actions: '<button type="button">Нравится</button>' },
		})

		expect(screen.queryByRole('button', { name: 'Копировать ответ' })).toBeNull()
		expect(screen.getByRole('button', { name: 'Нравится' })).toBeInTheDocument()
	})

	it('has-copy=false без слота actions — блока действий нет', () => {
		const { container } = render(BaseAiMessage, { props: { content: 'Ответ', hasCopy: false } })
		expect(container.querySelector('.base-ai-message__actions')).toBeNull()
	})

	it('слот default — перед ответом', () => {
		const { container } = render(BaseAiMessage, {
			props: { content: 'Ответ' },
			slots: { default: '<div class="before">Рассуждение</div>' },
		})
		const before = container.querySelector('.before') as HTMLElement
		expect(before.compareDocumentPosition(container.querySelector('.base-markdown') as HTMLElement)).toBe(
			Node.DOCUMENT_POSITION_FOLLOWING,
		)
	})

	it('вариант, масштаб и customClass', () => {
		const { container } = render(BaseAiMessage, {
			props: { content: 'Ответ', variant: 'soft', sizeScale: 125, customClass: { root: 'my-root', body: 'my-body' } },
		})
		const root = container.querySelector('.base-ai-message') as HTMLElement

		expect(root).toHaveClass('base-ai-message--soft', 'my-root')
		expect(root.style.getPropertyValue('--size-scale')).toBe('1.25')
		expect(container.querySelector('.base-ai-message__body')).toHaveClass('my-body')
	})
})
