import { expect } from 'storybook/test'
import type meta from '../../BaseStat.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const CustomColor: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: 'Свой фон и текст через `color`: подпись и значение берут цвет текста. Цвета изменения — токены ролей, на своём фоне проверьте их контраст.',
			},
		},
	},
	args: { color: { bg: { base: '#6d28d9' }, text: { base: '#ffffff' } }, change: undefined },
	play: async ({ canvasElement }) => {
		const element = canvasElement.querySelector('.base-stat') as HTMLElement
		await expect(getComputedStyle(element).backgroundColor).toBe('rgb(109, 40, 217)')
	},
}
