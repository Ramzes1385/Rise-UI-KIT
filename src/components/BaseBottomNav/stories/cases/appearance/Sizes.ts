import { expect } from 'storybook/test'
import type meta from '../../BaseBottomNav.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseBottomNav from '../../../ui/BaseBottomNav.vue'
import { literal, SIZE_PRESETS, sizeLabel, storySource, useStorySetup } from '@/stories/helpers'

const presets = SIZE_PRESETS.map(preset => ({ name: preset.name, sizeScale: preset.sizeScale, label: sizeLabel(preset) }))

const template = `
	<div class="story-stack story-narrow">
		<BaseBottomNav v-for="preset in presets" :key="preset.name" v-bind="args" :size-scale="preset.sizeScale" :aria-label="preset.label" />
	</div>
`

export const Sizes: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: { story: 'Размеры через `sizeScale`: 75 / 87.5 / 100 / 112.5 / 125 — значки, подписи, отступы и бейджи.' },
			source: storySource({
				template,
				imports: ['BaseBottomNav'],
				script: `const presets = ${literal(presets)}`,
				omit: ['ariaLabel'],
			}),
		},
		controls: { include: ['variant'] },
	},
	render: args => ({
		components: { BaseBottomNav },
		setup: useStorySetup(args, { data: { presets } }),
		template,
	}),
	play: async ({ canvas }) => {
		await expect(canvas.getAllByRole('navigation')).toHaveLength(presets.length)
	},
}
