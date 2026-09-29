import { REACTIONS } from '../../shared'
import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../BaseEmojiPicker.stories'
import BaseEmojiPicker from '../../../ui/BaseEmojiPicker.vue'
import { SIZE_PRESETS, sizeLabel, useArgsWithoutSlots } from '@/stories/helpers'

export const Sizes: StoryObj<typeof meta> = {
	parameters: {
		docs: { description: { story: 'Размеры через `sizeScale`: 75 / 87.5 / 100 / 112.5 / 125.' } },
		controls: { include: ['variant'] },
	},
	render: args => ({
		components: { BaseEmojiPicker },
		setup: () => ({ props: useArgsWithoutSlots(args), presets: SIZE_PRESETS, sizeLabel, reactions: REACTIONS }),
		template:
			'<div style="display: flex; flex-wrap: wrap; gap: 16px; align-items: start"><BaseEmojiPicker v-for="preset in presets" :key="preset.name" v-bind="props" :size-scale="preset.sizeScale" :emojis="reactions" :has-search="false" :aria-label="sizeLabel(preset)" /></div>',
	}),
}
