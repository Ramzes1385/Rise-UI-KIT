import { REACTIONS } from '../../shared'
import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../BaseEmojiPicker.stories'
import BaseEmojiPicker from '../../../ui/BaseEmojiPicker.vue'
import { literal, storySource, useStorySetup } from '@/stories/helpers'
import { EMOJI_PICKER_VARIANTS } from '../../../types/BaseEmojiPicker.types'

const reactions = REACTIONS

const template = `
	<div style="display: flex; flex-wrap: wrap; gap: 16px; align-items: start">
		<BaseEmojiPicker
			v-for="variant in EMOJI_PICKER_VARIANTS"
			:key="variant"
			v-bind="args"
			:variant="variant"
			:emojis="reactions"
			:columns="8" />
	</div>
`

export const Variants: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: { story: 'Все варианты оформления. Размер из Controls применяется ко всем.' },
			source: storySource({
				template,
				imports: ['BaseEmojiPicker', 'EMOJI_PICKER_VARIANTS', 'type EmojiPickerItem'],
				script: `const reactions: EmojiPickerItem[] = ${literal(reactions)}`,
			}),
		},
		controls: { include: ['sizeScale'] },
	},
	render: args => ({
		components: { BaseEmojiPicker },
		setup: useStorySetup(args, { data: { EMOJI_PICKER_VARIANTS, reactions } }),
		template,
	}),
}
