import { expect } from 'storybook/test'
import type meta from '../BaseStack.stories'
import { isStoryBranded } from '@/stories/helpers'
import type { StoryObj } from '@storybook/vue3-vite'

export const Default: StoryObj<typeof meta> = {
	parameters: { docs: { description: { story: 'Песочница: меняйте `direction`, `gap`, `align`, `justify` и `isWrap` в Controls.' } } },
	play: async ({ canvasElement }) => {
		const stack = canvasElement.querySelector('.base-stack') as HTMLElement
		await expect(getComputedStyle(stack).display).toBe('flex')
		await expect(getComputedStyle(stack).flexDirection).toBe('column')
		if (!isStoryBranded()) await expect(getComputedStyle(stack).rowGap).toBe('16px')
		const [first, second] = [...stack.children].map(child => child.getBoundingClientRect())
		if (!isStoryBranded()) await expect(Math.round(second.top - first.bottom)).toBe(16)
	},
}
