import { expect } from 'storybook/test'
import type meta from '../../BaseRoadmap3D.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const Loading: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: { story: 'Данные загружаются: область помечена `aria-busy`, скринридер знает, что содержимое ещё не готово.' },
		},
	},
	args: { isLoading: true, ariaLabel: 'Путь загружается' },
	play: async ({ canvas }) => {
		await expect(await canvas.findByRole('region', { name: 'Путь загружается' })).toHaveAttribute('aria-busy', 'true')
	},
}
