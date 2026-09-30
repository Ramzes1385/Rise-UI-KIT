import { expect } from 'storybook/test'
import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../BaseFilterBuilder.stories'

export const CustomColor: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: { story: 'Свой фон и текст панели через `color`. Для статусов берите токены ролей: `var(--rise-info-soft)`.' },
		},
	},
	args: { color: { bg: { base: 'var(--rise-info-soft)' }, text: { base: 'var(--rise-info-text)' } } },
	play: async ({ canvasElement }) => {
		const element = canvasElement.querySelector('.base-filter-builder') as HTMLElement
		await expect(getComputedStyle(element).backgroundColor).not.toBe(getComputedStyle(document.body).backgroundColor)
	},
}
