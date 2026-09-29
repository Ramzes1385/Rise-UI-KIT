import { tabTo } from '@/stories/helpers'
import type meta from '../../BaseSelect.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import { expect, within, screen } from 'storybook/test'

export const Keyboard: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Клавиатура: Tab ставит фокус на триггер, стрелка вниз открывает список, стрелки двигают активную опцию,',
					'Enter выбирает её и закрывает список, Escape закрывает без выбора.',
				].join('\n'),
			},
		},
	},
	tags: ['!autodocs'],
	play: async ({ canvas, userEvent }) => {
		const trigger = canvas.getByRole('combobox', { name: 'Город доставки' })
		await tabTo(trigger, userEvent)

		await userEvent.keyboard('{ArrowDown}')
		await expect(trigger).toHaveAttribute('aria-expanded', 'true')
		const options = within(await screen.findByRole('listbox', { name: 'Город доставки' })).getAllByRole('option')
		await expect(trigger).toHaveAttribute('aria-activedescendant', options[0]?.id)

		await userEvent.keyboard('{ArrowDown}{Enter}')
		await expect(trigger).toHaveAttribute('aria-expanded', 'false')
		await expect(trigger).toHaveTextContent('Санкт-Петербург')
		await expect(trigger).toHaveFocus()

		await userEvent.keyboard('{Enter}')
		await expect(trigger).toHaveAttribute('aria-expanded', 'true')
		await userEvent.keyboard('{Escape}')
		await expect(trigger).toHaveAttribute('aria-expanded', 'false')
		await expect(trigger).toHaveTextContent('Санкт-Петербург')
	},
}
