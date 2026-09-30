import { expect } from 'storybook/test'
import type meta from '../BaseQrCode.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const CustomColor: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: 'Свои цвета — `moduleColor` и `backgroundColor`: модули тёмные, фон светлый, контраст высокий.',
			},
		},
	},
	args: { moduleColor: '#1e3a8a', backgroundColor: '#eff6ff' },
	play: async ({ canvasElement }) => {
		await expect(canvasElement.querySelector('path')).toHaveAttribute('fill', '#1e3a8a')
		await expect(canvasElement.querySelector('rect')).toHaveAttribute('fill', '#eff6ff')
	},
}
