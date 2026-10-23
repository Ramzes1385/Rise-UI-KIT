import { expect } from 'storybook/test'
import type meta from '../BaseIcon.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const Default: StoryObj<typeof meta> = {
	parameters: {
		docs: { description: { story: 'Песочница: выберите иконку и меняйте props в панели Controls. Размер по умолчанию — 20px.' } },
	},
	play: async ({ canvasElement }) => {
		const svg = canvasElement.querySelector('svg') as SVGSVGElement
		await expect(svg.querySelector('use')).toHaveAttribute('href', 'icons.svg#search')
		await expect(svg.getBoundingClientRect().width).toBe(20)
		await expect(svg).toHaveAttribute('aria-hidden', 'true')
	},
}
