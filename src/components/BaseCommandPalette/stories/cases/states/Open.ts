import type { StoryObj } from '@storybook/vue3-vite'
import { expect, screen, within } from 'storybook/test'
import type meta from '../../BaseCommandPalette.stories'

export const Open: StoryObj<typeof meta> = {
	parameters: {
		docs: { description: { story: 'Открытая палитра: группы, значки, сочетания клавиш, недоступная команда и подсказка внизу.' } },
	},
	args: { isOpen: true, hotkey: null },
	play: async ({ userEvent }) => {
		const dialog = await screen.findByRole('dialog', { name: 'Палитра команд' })
		await userEvent.keyboard('{End}')
		await expect(within(dialog).getByRole('option', { name: /Во весь экран/ })).toHaveAttribute('aria-selected', 'true')
		await userEvent.keyboard('{ArrowUp}{ArrowUp}')
		await expect(within(dialog).getByRole('option', { name: /Новая задача/ })).not.toHaveAttribute('aria-selected', 'true')
		await expect(within(dialog).getByRole('option', { name: /Загрузить файл/ })).toHaveAttribute('aria-selected', 'true')
	},
}
