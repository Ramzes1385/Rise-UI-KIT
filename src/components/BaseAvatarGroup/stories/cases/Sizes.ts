import type meta from '../BaseAvatarGroup.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseAvatarGroup from '../../ui/BaseAvatarGroup.vue'
import { useArgsWithoutSlots, SIZE_PRESETS, sizeLabel } from '@/stories/helpers'

export const Sizes: StoryObj<typeof meta> = {
	parameters: {
		docs: { description: { story: 'Размеры через `sizeScale`: аватары и нахлёст масштабируются вместе.' } },
		controls: { include: ['variant', 'shape'] },
	},
	render: args => ({
		components: { BaseAvatarGroup },
		setup: () => ({
			props: useArgsWithoutSlots(args, ['sizeScale']),
			presets: SIZE_PRESETS.filter(preset => ['xs', 'md', 'xl'].includes(preset.name)),
			sizeLabel,
		}),
		template:
			'<div class="story-stack"><div v-for="preset in presets" :key="preset.name" class="story-row"><span class="story-label" style="width: 96px;">{{ sizeLabel(preset) }}</span><BaseAvatarGroup v-bind="props" :size-scale="preset.sizeScale" /></div></div>',
	}),
}
