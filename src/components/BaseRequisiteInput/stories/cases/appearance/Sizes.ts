import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../BaseRequisiteInput.stories'
import BaseRequisiteInput from '../../../ui/BaseRequisiteInput.vue'
import { SIZE_PRESETS, sizeLabel, useArgsWithoutSlots } from '@/stories/helpers'

export const Sizes: StoryObj<typeof meta> = {
	parameters: {
		docs: { description: { story: 'Размеры через `sizeScale`: 75 / 87.5 / 100 / 112.5 / 125.' } },
		controls: { include: ['variant'] },
	},
	args: { modelValue: '7707083893' },
	render: args => ({
		components: { BaseRequisiteInput },
		setup: () => ({ props: useArgsWithoutSlots(args), presets: SIZE_PRESETS, sizeLabel }),
		template: `
			<div style="display: flex; flex-direction: column; gap: 16px; max-width: 320px">
				<BaseRequisiteInput v-for="preset in presets" :key="preset.name" v-bind="props" :size-scale="preset.sizeScale" :label="sizeLabel(preset)" />
			</div>`,
	}),
}
