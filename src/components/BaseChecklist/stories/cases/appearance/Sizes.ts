import type meta from '../../BaseChecklist.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseChecklist from '../../../ui/BaseChecklist.vue'
import { SIZE_PRESETS, sizeLabel, useArgsWithoutSlots } from '@/stories/helpers'

export const Sizes: StoryObj<typeof meta> = {
	parameters: {
		docs: { description: { story: 'Размеры через `sizeScale`: 75 / 87.5 / 100 / 112.5 / 125.' } },
		controls: { include: ['variant'] },
	},
	render: args => ({
		components: { BaseChecklist },
		setup: () => ({ props: useArgsWithoutSlots(args), presets: SIZE_PRESETS, sizeLabel }),
		template: `
			<div style="display: flex; flex-wrap: wrap; align-items: flex-start; gap: 16px">
				<BaseChecklist
					v-for="preset in presets"
					:key="preset.name"
					v-bind="props"
					:size-scale="preset.sizeScale"
					:title="sizeLabel(preset)"
					style="width: 360px" />
			</div>`,
	}),
}
