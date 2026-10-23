import { expect } from 'storybook/test'
import { LOADER_VARIANTS } from '../../shared'
import type meta from '../../BaseLoader.stories'
import BaseLoader from '../../../ui/BaseLoader.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { literal, storySource, useStorySetup } from '@/stories/helpers'

const variants = LOADER_VARIANTS

const template = `
	<div class="story-row" style="gap: 24px;">
		<BaseLoader v-for="variant in variants" :key="variant" v-bind="args" :variant="variant" />
	</div>
`

export const CustomColor: StoryObj<typeof meta> = {
	args: { color: { text: { base: '#7c3aed' } } },
	parameters: {
		docs: {
			description: { story: 'Кастомный цвет через `color.text`: перекрашивает любой вид индикатора, например под цвет раздела.' },
			source: storySource({ template, imports: ['BaseLoader'], script: `const variants = ${literal(variants)}` }),
		},
		controls: { include: ['color', 'sizeScale'] },
	},
	render: args => ({
		components: { BaseLoader },
		setup: useStorySetup(args, { data: { variants } }),
		template,
	}),
	play: async ({ canvasElement }) => {
		const arc = canvasElement.querySelector('.base-loader__spinner-fill') as SVGElement
		await expect(getComputedStyle(arc).stroke).toBe('rgb(124, 58, 237)')
		const dot = canvasElement.querySelector('.base-loader__dot') as HTMLElement
		await expect(getComputedStyle(dot).backgroundColor).toBe('rgb(124, 58, 237)')
	},
}
