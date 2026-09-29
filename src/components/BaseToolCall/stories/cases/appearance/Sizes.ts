import type meta from '../../BaseToolCall.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseToolCall from '../../../ui/BaseToolCall.vue'
import { SIZE_PRESETS, sizeLabel, useArgsWithoutSlots } from '@/stories/helpers'

export const Sizes: StoryObj<typeof meta> = {
	parameters: {
		docs: { description: { story: 'Размеры через `sizeScale`: 75 / 87.5 / 100 / 112.5 / 125.' } },
		controls: { include: ['variant'] },
	},
	render: args => ({
		components: { BaseToolCall },
		setup: () => ({ props: useArgsWithoutSlots(args), presets: SIZE_PRESETS, sizeLabel }),
		template:
			'<div style="display: grid; gap: 12px; max-width: 560px"><BaseToolCall v-for="preset in presets" :key="preset.name" v-bind="props" :size-scale="preset.sizeScale" :title="sizeLabel(preset)" /></div>',
	}),
}
