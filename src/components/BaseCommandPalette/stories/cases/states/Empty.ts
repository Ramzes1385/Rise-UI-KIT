import type { StoryObj } from '@storybook/vue3-vite'
import { expect, screen, within } from 'storybook/test'
import type meta from '../../BaseCommandPalette.stories'

export const Empty: StoryObj<typeof meta> = {
	parameters: { docs: { description: { story: 'Ничего не найдено: текст под полем поиска, его можно заменить слотом `empty`.' } } },
	args: { isOpen: true, hotkey: null, commands: [] },
	play: async () => {
		const dialog = await screen.findByRole('dialog', { name: 'Палитра команд' })
		await expect(within(dialog).getByText('Ничего не найдено')).toBeInTheDocument()
	},
}
