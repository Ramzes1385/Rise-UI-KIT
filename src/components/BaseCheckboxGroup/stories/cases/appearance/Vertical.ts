import { expect } from 'storybook/test'
import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../BaseCheckboxGroup.stories'

export const Vertical: StoryObj<typeof meta> = {
	parameters: {
		docs: { description: { story: 'Столбиком (`isVertical`): для длинных подписей и списков из пяти и больше вариантов.' } },
	},
	args: { isVertical: true, hasSelectAll: true },
	play: async ({ canvasElement }) => {
		const options = canvasElement.querySelector('.base-checkbox-group__options') as HTMLElement
		await expect(getComputedStyle(options).flexDirection).toBe('column')
	},
}
