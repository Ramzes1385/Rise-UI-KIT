import { expect } from 'storybook/test'
import type meta from '../../BaseTag.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const CustomColor: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: 'Свой цвет через `color` поверх роли. Для статусов лучше `tone`: его токены уже подобраны для обеих тем.',
			},
		},
	},
	args: { isSelectable: false, color: { bg: { base: '#6d28d9' }, text: { base: '#ffffff' } } },
	play: async ({ canvasElement }) => {
		const element = canvasElement.querySelector('.base-tag') as HTMLElement
		await expect(getComputedStyle(element).backgroundColor).toBe('rgb(109, 40, 217)')
	},
}
