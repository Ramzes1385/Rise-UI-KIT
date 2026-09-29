import { expect } from 'storybook/test'
import type meta from '../../BaseAccordion.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const Multiple: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: '`isMultiple`: можно раскрыть несколько пунктов одновременно; открытые пункты закрываются только своим заголовком.',
			},
		},
	},
	args: { isMultiple: true },
	play: async ({ canvas }) => {
		await expect(canvas.getAllByRole('button', { expanded: true })).toHaveLength(1)
	},
}
