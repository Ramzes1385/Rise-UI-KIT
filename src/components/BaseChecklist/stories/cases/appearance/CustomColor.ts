import { expect } from 'storybook/test'
import type meta from '../../BaseChecklist.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const CustomColor: StoryObj<typeof meta> = {
	parameters: {
		docs: { description: { story: 'Свой фон и текст через `color`. Для статусов берите токены ролей: `var(--rise-success-soft)`.' } },
	},
	args: { color: { bg: { base: 'var(--rise-success-soft)' }, text: { base: 'var(--rise-success-text)' } } },
	play: async ({ canvasElement }) => {
		const element = canvasElement.querySelector('.base-checklist') as HTMLElement
		await expect(getComputedStyle(element).backgroundColor).not.toBe(getComputedStyle(document.body).backgroundColor)
	},
}
