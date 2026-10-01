import '@testing-library/jest-dom/vitest'
import BaseAiMessage from '../ui/BaseAiMessage.vue'
import { fireEvent, render, screen } from '@testing-library/vue'

const mockClipboard = (writeText: (text: string) => Promise<void>) =>
	Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } })

describe('BaseAiMessage — компоненты кита вместо своей разметки', () => {
	afterEach(() => {
		Reflect.deleteProperty(navigator, 'clipboard')
	})

	it('индикатор печати — BaseLoader dots, скрыт от скринридера и не даёт второй status', () => {
		const { container } = render(BaseAiMessage, { props: { isStreaming: true } })
		const typing = container.querySelector('.base-ai-message__typing')

		expect(typing).toHaveClass('base-loader', 'base-loader--dots')
		expect(typing).toHaveAttribute('aria-hidden', 'true')
		expect(screen.getAllByRole('status')).toHaveLength(1)
		expect(screen.getByRole('status')).toHaveTextContent('Ассистент отвечает')
	})

	it('индикатор печати масштабируется: 75% от sizeScale', () => {
		const { container } = render(BaseAiMessage, { props: { isStreaming: true, sizeScale: 200 } })

		expect(container.querySelector('.base-ai-message__typing')).toHaveStyle({ '--size-scale': '1.5' })
	})

	it('при content индикатора печати нет', () => {
		const { container } = render(BaseAiMessage, { props: { isStreaming: true, content: 'Ответ' } })

		expect(container.querySelector('.base-ai-message__typing')).toBeNull()
		expect(container.querySelector('.base-loader')).toBeNull()
	})

	it('«Повторить» — кнопка type=button с прежними классами, клик шлёт retry', async () => {
		const { emitted } = render(BaseAiMessage, { props: { error: 'Сбой' } })
		const retry = screen.getByRole('button', { name: 'Повторить' })

		expect(retry).toHaveAttribute('type', 'button')
		expect(retry).toHaveClass('base-button', 'base-ai-message__action', 'base-ai-message__action--retry')
		expect(retry.querySelector('.base-button__slot-left .base-icon')).toBeInTheDocument()
		await fireEvent.click(retry)
		expect(emitted('retry')).toEqual([[]])
	})

	it('«Копировать» — кнопка type=button, копирует content и меняет подпись на «Скопировано»', async () => {
		const writeText = vi.fn(async (_text: string) => undefined)
		mockClipboard(writeText)
		render(BaseAiMessage, { props: { content: 'Текст ответа' } })
		const copy = screen.getByRole('button', { name: 'Копировать ответ' })

		expect(copy).toHaveAttribute('type', 'button')
		expect(copy).toHaveClass('base-button', 'base-ai-message__action')
		expect(copy).not.toHaveClass('base-ai-message__action--retry')
		expect(copy.querySelector('.base-button__slot-left .base-icon')).toBeInTheDocument()
		await fireEvent.click(copy)
		expect(await screen.findByRole('button', { name: 'Скопировано' })).toBe(copy)
		expect(writeText).toHaveBeenCalledWith('Текст ответа')
	})

	it('кнопки фокусируемы и не отключены', async () => {
		render(BaseAiMessage, { props: { content: 'Ответ', error: 'Сбой' } })
		const retry = screen.getByRole('button', { name: 'Повторить' })
		const copy = screen.getByRole('button', { name: 'Копировать ответ' })

		retry.focus()
		expect(retry).toHaveFocus()
		copy.focus()
		expect(copy).toHaveFocus()
		expect(retry).toBeEnabled()
		expect(copy).toBeEnabled()
	})
})
