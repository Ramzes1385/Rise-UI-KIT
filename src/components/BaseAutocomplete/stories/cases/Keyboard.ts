import { expect } from 'storybook/test'
import { tabTo } from '@/stories/helpers'
import type meta from '../BaseAutocomplete.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const Keyboard: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: 'Клавиатура: ↓ открывает список и ведёт по вариантам (отключённый пропускается), Enter выбирает, Escape очищает поле.',
			},
		},
	},
	tags: ['!autodocs'],
	play: async ({ canvas, userEvent, args }) => {
		const field = canvas.getByRole('combobox', { name: 'Город доставки' })
		await tabTo(field, userEvent)
		await userEvent.keyboard('{ArrowDown}')
		await expect(field).toHaveAttribute('aria-expanded', 'true')
		await userEvent.keyboard('{ArrowDown}{Enter}')
		await expect(args.onChange).toHaveBeenLastCalledWith('spb')
		await expect(field).toHaveValue('Санкт-Петербург')
		await userEvent.keyboard('{Escape}')
		await expect(args.onChange).toHaveBeenLastCalledWith(null)
		await expect(field).toHaveValue('')
	},
}
