import { docsFrame } from '../../shared'
import type meta from '../../BaseTour.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import { screen, expect, within } from 'storybook/test'

export const LastStep: StoryObj<typeof meta> = {
	args: { isOpen: true, step: 2 },
	parameters: {
		docs: {
			...docsFrame(320),
			description: { story: 'Последний шаг: «Назад» и «Завершить». «Завершить» закрывает тур с событием `finish`.' },
		},
	},
	play: async () => {
		const dialog = await screen.findByRole('dialog', { name: 'Настройки' })
		await expect(await within(dialog).findByRole('button', { name: 'Завершить' })).toBeInTheDocument()
		await expect(within(dialog).getByRole('button', { name: 'Назад' })).toBeInTheDocument()
		await expect(within(dialog).getByText('3 / 3')).toBeInTheDocument()
	},
}
