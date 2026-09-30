import type meta from '../BaseUser.stories'
import BaseUser from '../../ui/BaseUser.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { literal, SIZE_PRESETS, sizeLabel, storySource, useStorySetup } from '@/stories/helpers'

const presets = SIZE_PRESETS.filter(preset => ['xs', 'md', 'xl'].includes(preset.name)).map(preset => ({
	name: preset.name,
	sizeScale: preset.sizeScale,
	label: sizeLabel(preset),
}))

const template = `
	<div class="story-stack"><div v-for="preset in presets" :key="preset.name" class="story-row"><span class="story-label" style="width: 96px;">{{ preset.label }}</span><BaseUser v-bind="args" :size-scale="preset.sizeScale" /></div></div>
`

export const Sizes: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: { story: 'Размеры через `sizeScale`: аватар и текст масштабируются вместе.' },
			source: storySource({ template, imports: ['BaseUser'], script: `const presets = ${literal(presets)}`, omit: ['sizeScale'] }),
		},
		controls: { include: ['orientation'] },
	},
	render: args => ({
		components: { BaseUser },
		setup: useStorySetup(args, { data: { presets }, slots: ['sizeScale'] }),
		template,
	}),
}
