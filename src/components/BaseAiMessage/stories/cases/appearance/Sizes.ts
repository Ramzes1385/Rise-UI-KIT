import type meta from '../../BaseAiMessage.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseAiMessage from '../../../ui/BaseAiMessage.vue'
import { SIZE_PRESETS, sizeLabel, useArgsWithoutSlots } from '@/stories/helpers'

export const Sizes: StoryObj<typeof meta> = {
	parameters: {
		docs: { description: { story: 'Размеры через `sizeScale`: 75 / 87.5 / 100 / 112.5 / 125.' } },
		controls: { include: ['variant'] },
	},
	render: args => ({
		components: { BaseAiMessage },
		setup: () => ({ props: useArgsWithoutSlots(args), presets: SIZE_PRESETS, sizeLabel }),
		template:
			'<div style="display: grid; gap: 24px"><BaseAiMessage v-for="preset in presets" :key="preset.name" v-bind="props" :size-scale="preset.sizeScale" :content="sizeLabel(preset)" /></div>',
	}),
}
