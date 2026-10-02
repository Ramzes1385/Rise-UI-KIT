import { expect } from 'storybook/test'
import type meta from '../../BaseCode.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const CustomColor: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: 'Свой фон через `color`. Цвета подсветки рассчитаны на светлый фон в светлой теме и тёмный — в тёмной, поэтому берите токены темы, а не постоянный HEX: здесь `var(--rise-info-soft)`.',
			},
		},
	},
	args: { color: { bg: { base: 'var(--rise-info-soft)' } } },
	play: async ({ canvasElement }) => {
		const element = canvasElement.querySelector('.base-code') as HTMLElement
		const probe = document.createElement('span')
		probe.style.backgroundColor = 'var(--rise-info-soft)'
		element.append(probe)
		const expected = getComputedStyle(probe).backgroundColor
		probe.remove()
		await expect(getComputedStyle(element).backgroundColor).toBe(expected)
	},
}
