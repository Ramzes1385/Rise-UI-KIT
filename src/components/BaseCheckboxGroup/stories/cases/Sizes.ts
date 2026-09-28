import type meta from '../BaseCheckboxGroup.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseCheckboxGroup from '../../ui/BaseCheckboxGroup.vue'
import { useArgsWithoutSlots, SIZE_PRESETS, sizeLabel } from '@/stories/helpers'

export const Sizes: StoryObj<typeof meta> = {
	parameters: {
		docs: { description: { story: 'Размеры через `sizeScale`: подпись, флажки и зазоры масштабируются вместе.' } },
		controls: { include: ['variant'] },
	},
	render: args => ({
		components: { BaseCheckboxGroup },
		setup: () => ({
			props: useArgsWithoutSlots(args, ['sizeScale', 'label']),
			presets: SIZE_PRESETS.filter(preset => ['xs', 'md', 'xl'].includes(preset.name)),
			sizeLabel,
		}),
		template: `
			<div class="story-stack">
				<BaseCheckboxGroup v-for="preset in presets" :key="preset.name" v-bind="props" :size-scale="preset.sizeScale" :label="sizeLabel(preset)" />
			</div>
		`,
	}),
}
