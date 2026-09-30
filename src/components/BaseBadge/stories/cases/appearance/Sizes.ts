import { expect } from 'storybook/test'
import type meta from '../../BaseBadge.stories'
import BaseBadge from '../../../ui/BaseBadge.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { literal, SIZE_PRESETS, sizeLabel, storySource, useStorySetup } from '@/stories/helpers'

const presets = SIZE_PRESETS.map(preset => ({ name: preset.name, sizeScale: preset.sizeScale, label: sizeLabel(preset) }))

const template = `
	<div class="story-row">
		<BaseBadge v-for="preset in presets" :key="preset.name" v-bind="args" :size-scale="preset.sizeScale" :label="preset.label" />
	</div>
`

export const Sizes: StoryObj<typeof meta> = {
	parameters: {
		controls: { include: ['variant'] },
		docs: {
			description: {
				story: 'Размеры через `sizeScale`: при 100 высота 20px; текст, отступы и радиус масштабируются, рамка 1px — нет.',
			},
			source: storySource({ template, imports: ['BaseBadge'], script: `const presets = ${literal(presets)}` }),
		},
	},
	render: args => ({
		components: { BaseBadge },
		setup: useStorySetup(args, { data: { presets } }),
		template,
	}),
	play: async ({ canvas }) => {
		const [xs, md, xl] = ['xs · 75', 'md · 100', 'xl · 125'].map(
			label => canvas.getByText(label).closest('.base-badge')?.getBoundingClientRect().height ?? 0,
		)
		await expect(md).toBe(20)
		await expect(xs).toBeLessThan(md)
		await expect(xl).toBeGreaterThan(md)
	},
}
