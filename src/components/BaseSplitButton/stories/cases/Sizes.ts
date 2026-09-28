import type meta from '../BaseSplitButton.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseSplitButton from '../../ui/BaseSplitButton.vue'
import { useArgsWithoutSlots, SIZE_PRESETS, sizeLabel } from '@/stories/helpers'

export const Sizes: StoryObj<typeof meta> = {
	parameters: { docs: { description: { story: 'Размеры через `sizeScale`.' } }, controls: { include: ['variant'] } },
	render: args => ({
		components: { BaseSplitButton },
		setup: () => ({
			props: useArgsWithoutSlots(args, ['sizeScale', 'label']),
			presets: SIZE_PRESETS.filter(preset => ['xs', 'md', 'xl'].includes(preset.name)),
			sizeLabel,
		}),
		template:
			'<div class="story-row"><BaseSplitButton v-for="preset in presets" :key="preset.name" v-bind="props" :size-scale="preset.sizeScale" :label="sizeLabel(preset)" /></div>',
	}),
}
