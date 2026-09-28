import { expect } from 'storybook/test'
import type meta from '../BaseSkeleton.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const Default: StoryObj<typeof meta> = {
	parameters: {
		docs: { description: { story: 'Песочница: меняйте props в панели Controls. Скелетон декоративный и скрыт от скринридеров.' } },
	},
	play: async ({ canvasElement }) => {
		const skeleton = canvasElement.querySelector('.base-skeleton') as HTMLElement
		await expect(skeleton).toHaveAttribute('aria-hidden', 'true')
		await expect(skeleton.getBoundingClientRect().height).toBe(16)
	},
}
