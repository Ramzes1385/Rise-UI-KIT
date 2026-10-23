import { SHORT } from '../../shared'
import { expect } from 'storybook/test'
import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../BaseDescriptions.stories'

export const CustomColor: StoryObj<typeof meta> = {
	parameters: {
		docs: { description: { story: 'Свой фон через `color`. Для статусов берите токены ролей: `var(--rise-success-soft)`.' } },
	},
	args: { items: SHORT, color: { bg: { base: 'var(--rise-info-soft)' } } },
	play: async ({ canvasElement }) => {
		const element = canvasElement.querySelector('.base-descriptions') as HTMLElement
		await expect(getComputedStyle(element).backgroundColor).not.toBe(getComputedStyle(document.body).backgroundColor)
	},
}
