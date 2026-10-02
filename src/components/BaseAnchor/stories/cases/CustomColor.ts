import { items } from '../shared'
import { expect } from 'storybook/test'
import type meta from '../BaseAnchor.stories'
import BaseAnchor from '../../ui/BaseAnchor.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { literal, storySource, useStorySetup } from '@/stories/helpers'

const template = `<BaseAnchor v-bind="args" :items="items" style="width: 200px" />`

export const CustomColor: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: 'Свой цвет через `color`: `bg.base` — отметка текущего пункта (у `soft` — заливка), `text.active` — текст текущего пункта; цвет текста проверьте на контраст в обеих темах.',
			},
			source: storySource({ template, imports: ['BaseAnchor'], script: `const items = ${literal(items)}` }),
		},
	},
	args: { color: { bg: { base: '#6d28d9' } } },
	render: args => ({
		components: { BaseAnchor },
		setup: useStorySetup(args, { data: { items } }),
		template,
	}),
	play: async ({ canvas }) => {
		const current = canvas.getByRole('link', { name: 'Обзор' })
		await expect(getComputedStyle(current, '::before').backgroundColor).toBe('rgb(109, 40, 217)')
		await expect(current).toHaveAttribute('aria-current', 'location')
	},
}
