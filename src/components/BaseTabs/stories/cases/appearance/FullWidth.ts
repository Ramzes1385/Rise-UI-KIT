import { TABS } from '../../shared'
import { expect } from 'storybook/test'
import type meta from '../../BaseTabs.stories'
import type { StoryObj } from '@storybook/vue3-vite'

const EQUAL_SHARE_MIN_WIDTH = 480
const FILL_RATIO = 0.9

export const FullWidth: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: '`isFullWidth` растягивает вкладки на всю ширину контейнера поровну; на узком экране вкладка не уже своей подписи, поэтому доли расходятся.',
			},
		},
	},
	args: { variant: 'pills', isFullWidth: true, items: TABS.slice(0, 3) },
	play: async ({ canvas }) => {
		const tabs = canvas.getAllByRole('tab')
		const list = canvas.getByRole('tablist')
		const widths = tabs.map(tab => Math.round(tab.getBoundingClientRect().width))
		await expect(widths.reduce((sum, width) => sum + width, 0)).toBeGreaterThanOrEqual(list.clientWidth * FILL_RATIO)
		if (list.clientWidth >= EQUAL_SHARE_MIN_WIDTH) await expect(Math.max(...widths) - Math.min(...widths)).toBeLessThanOrEqual(1)
	},
}
