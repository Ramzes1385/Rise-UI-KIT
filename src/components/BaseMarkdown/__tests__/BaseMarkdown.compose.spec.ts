import '@testing-library/jest-dom/vitest'
import BaseMarkdown from '../ui/BaseMarkdown.vue'
import { fireEvent, render, screen, waitFor } from '@testing-library/vue'

describe('BaseMarkdown: «Копировать» на BaseButton', () => {
	afterEach(() => {
		Reflect.deleteProperty(navigator, 'clipboard')
	})

	it('кнопка блока кода: type=button, прежний класс, копирует код и пишет «Скопировано»', async () => {
		const writeText = vi.fn(async (_text: string) => undefined)
		Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } })
		render(BaseMarkdown, { props: { source: '```js\nconst a = 1\n```' } })
		const button = screen.getByRole('button', { name: 'Копировать' })

		expect(button).toHaveAttribute('type', 'button')
		expect(button).toHaveClass('base-button', 'base-markdown__copy')
		await fireEvent.click(button)
		expect(writeText).toHaveBeenCalledWith('const a = 1')
		await waitFor(() => expect(button).toHaveTextContent('Скопировано'))
		expect(screen.getByRole('button', { name: 'Скопировано' })).toBe(button)
	})
})
