import { REACTIONS } from '../../shared'
import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../BaseEmojiPicker.stories'
import BaseEmojiPicker from '../../../ui/BaseEmojiPicker.vue'
import { literal, SIZE_PRESETS, sizeLabel, storySource, useStorySetup } from '@/stories/helpers'

const presets = SIZE_PRESETS.map(preset => ({ name: preset.name, sizeScale: preset.sizeScale, label: sizeLabel(preset) }))

const reactions = REACTIONS

const template = `
	<div style="display: flex; flex-wrap: wrap; gap: 16px; align-items: start">
		<BaseEmojiPicker
			v-for="preset in presets"
			:key="preset.name"
			v-bind="args"
			:size-scale="preset.sizeScale"
			:emojis="reactions"
			:has-search="false"
			:aria-label="preset.label" />
	</div>
`

const script = `
const presets = ${literal(presets)}
const reactions: EmojiPickerItem[] = ${literal(reactions)}
`

export const Sizes: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: { story: 'Размеры через `sizeScale`: 75 / 87.5 / 100 / 112.5 / 125.' },
			source: storySource({ template, imports: ['BaseEmojiPicker', 'type EmojiPickerItem'], script }),
		},
		controls: { include: ['variant'] },
	},
	render: args => ({
		components: { BaseEmojiPicker },
		setup: useStorySetup(args, { data: { presets, reactions } }),
		template,
	}),
}
