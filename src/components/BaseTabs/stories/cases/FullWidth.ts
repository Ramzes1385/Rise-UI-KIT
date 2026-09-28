import { TABS } from '../shared'
import { expect } from 'storybook/test'
import type meta from '../BaseTabs.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const FullWidth: StoryObj<typeof meta> = {
	parameters: { docs: { description: { story: '`isFullWidth` растягивает вкладки на всю ширину контейнера поровну.' } } },
	args: { variant: 'pills', isFullWidth: true, items: TABS.slice(0, 3) },
	play: async ({ canvas }) => {
		const [first, second] = canvas.getAllByRole('tab')
		await expect(Math.round(first.getBoundingClientRect().width)).toBe(Math.round(second.getBoundingClientRect().width))
	},
}
