import { docsFrame } from '../../shared'
import type meta from '../../BaseTour.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import { screen, within, expect } from 'storybook/test'

export const Minimal: StoryObj<typeof meta> = {
	args: { isOpen: true, showProgress: false, showSkip: false },
	parameters: {
		docs: {
			...docsFrame(320),
			description: {
				story: 'Минимальная карточка: без прогресса (`showProgress: false`) и без кнопки пропуска (`showSkip: false`).',
			},
		},
	},
	play: async () => {
		const dialog = await screen.findByRole('dialog', { name: 'Новый проект' })
		await within(dialog).findByRole('button', { name: 'Далее' })
		await expect(within(dialog).queryByRole('button', { name: 'Пропустить тур' })).not.toBeInTheDocument()
	},
}
