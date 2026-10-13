import '@testing-library/jest-dom/vitest'
import { UI_CHAT_TEXT } from '@/locales/messages'
import userEvent from '@testing-library/user-event'
import { render, screen } from '@testing-library/vue'
import { ChatSelectionToolbar } from '../../ui/ChatSelectionToolbar'

describe('ChatSelectionToolbar', () => {
	it('кнопка «Выбрать всё» эмитит select-all, пока выбраны не все', async () => {
		const { emitted } = render(ChatSelectionToolbar, { props: { selectedCount: 1, totalCount: 3 } })

		await userEvent.click(screen.getByRole('button', { name: UI_CHAT_TEXT.SELECT_ALL }))

		expect(emitted()['select-all']).toHaveLength(1)
	})

	it('когда выбраны все, кнопка недоступна, остаётся в фокусе и не эмитит', async () => {
		const { emitted } = render(ChatSelectionToolbar, { props: { selectedCount: 3, totalCount: 3 } })
		const button = screen.getByRole('button', { name: UI_CHAT_TEXT.SELECT_ALL })

		button.focus()
		await userEvent.click(button)

		expect(button).toHaveAttribute('aria-disabled', 'true')
		expect(button).toHaveFocus()
		expect(emitted()['select-all']).toBeUndefined()
	})

	it('без totalCount кнопка всегда доступна', () => {
		render(ChatSelectionToolbar, { props: { selectedCount: 5 } })

		expect(screen.getByRole('button', { name: UI_CHAT_TEXT.SELECT_ALL })).not.toHaveAttribute('aria-disabled', 'true')
	})
})
