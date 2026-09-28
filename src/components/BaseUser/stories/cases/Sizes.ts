import type meta from '../BaseUser.stories'
import BaseUser from '../../ui/BaseUser.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { useArgsWithoutSlots, SIZE_PRESETS, sizeLabel } from '@/stories/helpers'

export const Sizes: StoryObj<typeof meta> = {
	parameters: {
		docs: { description: { story: 'Размеры через `sizeScale`: аватар и текст масштабируются вместе.' } },
		controls: { include: ['orientation'] },
	},
	render: args => ({
		components: { BaseUser },
		setup: () => ({
			props: useArgsWithoutSlots(args, ['sizeScale']),
			presets: SIZE_PRESETS.filter(preset => ['xs', 'md', 'xl'].includes(preset.name)),
			sizeLabel,
		}),
		template:
			'<div class="story-stack"><div v-for="preset in presets" :key="preset.name" class="story-row"><span class="story-label" style="width: 96px;">{{ sizeLabel(preset) }}</span><BaseUser v-bind="props" :size-scale="preset.sizeScale" /></div></div>',
	}),
}
