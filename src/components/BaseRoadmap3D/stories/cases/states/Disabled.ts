import { expect } from 'storybook/test'
import type meta from '../../BaseRoadmap3D.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const Disabled: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: { story: 'Отключённый путь не принимает ввод: темы нельзя отметить, правка и статусы недоступны. Остров виден.' },
		},
	},
	args: { isDisabled: true, ariaLabel: 'Отключённый путь' },
	play: async ({ canvas }) => {
		await expect(await canvas.findByRole('region', { name: 'Отключённый путь' })).toHaveAttribute('aria-disabled', 'true')
	},
}
