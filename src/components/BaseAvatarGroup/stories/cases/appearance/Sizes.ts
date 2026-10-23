import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../BaseAvatarGroup.stories'
import BaseAvatarGroup from '../../../ui/BaseAvatarGroup.vue'
import { literal, SIZE_PRESETS, sizeLabel, storySource, useStorySetup } from '@/stories/helpers'

const presets = SIZE_PRESETS.filter(preset => ['xs', 'md', 'xl'].includes(preset.name)).map(preset => ({
	name: preset.name,
	sizeScale: preset.sizeScale,
	label: sizeLabel(preset),
}))

const template = `
	<div class="story-stack"><div v-for="preset in presets" :key="preset.name" class="story-row"><span class="story-label" style="width: 96px;">{{ preset.label }}</span><BaseAvatarGroup v-bind="args" :size-scale="preset.sizeScale" /></div></div>
`

export const Sizes: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: { story: 'Размеры через `sizeScale`: аватары и нахлёст масштабируются вместе.' },
			source: storySource({
				template,
				imports: ['BaseAvatarGroup'],
				script: `const presets = ${literal(presets)}`,
				omit: ['sizeScale'],
			}),
		},
		controls: { include: ['variant', 'shape'] },
	},
	render: args => ({
		components: { BaseAvatarGroup },
		setup: useStorySetup(args, { data: { presets }, slots: ['sizeScale'] }),
		template,
	}),
}
