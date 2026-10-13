import BaseKbd from '../../../ui/BaseKbd.vue'
import type meta from '../../BaseKbd.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import { literal, SIZE_PRESETS, sizeLabel, storySource, useStorySetup } from '@/stories/helpers'

const presets = SIZE_PRESETS.map(preset => ({ name: preset.name, sizeScale: preset.sizeScale, label: sizeLabel(preset) }))

const template = `
	<div class="story-row"><span v-for="preset in presets" :key="preset.name" class="story-row" style="gap: 4px;"><BaseKbd v-bind="args" :size-scale="preset.sizeScale" /><span class="story-label">{{ preset.label }}</span></span></div>
`

export const Sizes: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: { story: 'Размеры через `sizeScale`.' },
			source: storySource({ template, imports: ['BaseKbd'], script: `const presets = ${literal(presets)}`, omit: ['sizeScale'] }),
		},
		controls: { include: ['variant'] },
	},
	render: args => ({
		components: { BaseKbd },
		setup: useStorySetup(args, { data: { presets }, slots: ['sizeScale'] }),
		template,
	}),
}
