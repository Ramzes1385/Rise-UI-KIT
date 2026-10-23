import { expect } from 'storybook/test'
import type meta from '../BaseTextDiff.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const CustomColor: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: { story: 'Свой фон и текст через `color`. Для статусов берите токены ролей: `var(--rise-info-soft)`.' },
		},
	},
	args: { color: { bg: { base: 'var(--rise-info-soft)' }, text: { base: 'var(--rise-info-text)' } } },
	play: async ({ canvasElement }) => {
		const element = canvasElement.querySelector('.base-text-diff') as HTMLElement
		await expect(getComputedStyle(element).backgroundColor).not.toBe(getComputedStyle(document.body).backgroundColor)
	},
}
