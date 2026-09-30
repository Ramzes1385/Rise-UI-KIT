import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../BaseFilterBuilder.stories'
import BaseFilterBuilder from '../../../ui/BaseFilterBuilder.vue'
import { SIZE_PRESETS, useArgsWithoutSlots } from '@/stories/helpers'

export const Sizes: StoryObj<typeof meta> = {
	parameters: {
		docs: { description: { story: 'Размеры через `sizeScale`: 75 / 87.5 / 100 / 112.5 / 125.' } },
		controls: { include: ['variant'] },
	},
	render: args => ({
		components: { BaseFilterBuilder },
		setup: () => ({ props: useArgsWithoutSlots(args), presets: SIZE_PRESETS }),
		template: `
			<div style="display: flex; flex-direction: column; gap: 16px; max-width: 820px">
				<BaseFilterBuilder v-for="preset in presets" :key="preset.name" v-bind="props" :size-scale="preset.sizeScale" />
			</div>`,
	}),
}
