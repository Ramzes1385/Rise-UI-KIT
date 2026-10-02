import { tabTo } from '@/stories/helpers'
import type meta from '../../BaseCascader.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import { expect, screen, waitFor } from 'storybook/test'

const activeText = (field: HTMLElement): string =>
	document.getElementById(field.getAttribute('aria-activedescendant') ?? '')?.textContent?.trim() ?? ''

export const Keyboard: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Клавиатура: Tab ставит фокус на поле, стрелка вниз открывает панель, стрелки вверх и вниз ходят по колонке,',
					'вправо — раскрывает узел и переходит в следующую колонку, влево — возвращает; Enter выбирает конечный узел',
					'и закрывает панель, Escape закрывает без выбора.',
				].join('\n'),
			},
		},
	},
	tags: ['!autodocs'],
	play: async ({ canvas, userEvent }) => {
		const field = canvas.getByRole('combobox', { name: 'Район доставки' })
		await tabTo(field, userEvent)

		await userEvent.keyboard('{ArrowDown}')
		await expect(field).toHaveAttribute('aria-expanded', 'true')
		await expect(activeText(field)).toBe('Москва')

		await userEvent.keyboard('{ArrowDown}{ArrowRight}')
		await waitFor(() => expect(screen.getAllByRole('listbox')).toHaveLength(2))
		await expect(screen.getAllByRole('listbox')[1]).toHaveAccessibleName('Санкт-Петербург')
		await expect(activeText(field)).toBe('Адмиралтейский')

		await userEvent.keyboard('{ArrowDown}{ArrowLeft}')
		await expect(activeText(field)).toBe('Санкт-Петербург')
		await userEvent.keyboard('{ArrowRight}{End}{Enter}')
		await expect(field).toHaveAttribute('aria-expanded', 'false')
		await expect(field).toHaveTextContent('Санкт-Петербург / Петроградский')
		await expect(field).toHaveFocus()

		await userEvent.keyboard('{Enter}')
		await expect(field).toHaveAttribute('aria-expanded', 'true')
		await expect(activeText(field)).toBe('Петроградский')
		await userEvent.keyboard('{Escape}')
		await expect(field).toHaveAttribute('aria-expanded', 'false')
	},
}
