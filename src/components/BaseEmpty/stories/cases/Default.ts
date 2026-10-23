import { expect } from 'storybook/test'
import type meta from '../BaseEmpty.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const Default: StoryObj<typeof meta> = {
	parameters: {
		docs: { description: { story: 'Песочница: меняйте props в панели Controls. Иконка декоративная и скрыта от скринридера.' } },
	},
	play: async ({ canvas, canvasElement }) => {
		const title = canvas.getByRole('heading', { level: 3, name: 'Задач пока нет' })
		await expect(getComputedStyle(title).fontWeight).toBe('500')
		await expect(canvasElement.querySelector('svg')).toHaveAttribute('aria-hidden', 'true')
	},
}
