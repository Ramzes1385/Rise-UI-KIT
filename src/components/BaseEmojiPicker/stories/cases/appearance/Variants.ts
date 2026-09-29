import { REACTIONS } from '../../shared'
import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../BaseEmojiPicker.stories'
import { useArgsWithoutSlots } from '@/stories/helpers'
import BaseEmojiPicker from '../../../ui/BaseEmojiPicker.vue'
import { EMOJI_PICKER_VARIANTS } from '../../../types/BaseEmojiPicker.types'

export const Variants: StoryObj<typeof meta> = {
	parameters: {
		docs: { description: { story: 'Все варианты оформления. Размер из Controls применяется ко всем.' } },
		controls: { include: ['sizeScale'] },
	},
	render: args => ({
		components: { BaseEmojiPicker },
		setup: () => ({ props: useArgsWithoutSlots(args), variants: EMOJI_PICKER_VARIANTS, reactions: REACTIONS }),
		template:
			'<div style="display: flex; flex-wrap: wrap; gap: 16px; align-items: start"><BaseEmojiPicker v-for="variant in variants" :key="variant" v-bind="props" :variant="variant" :emojis="reactions" :columns="8" /></div>',
	}),
}
