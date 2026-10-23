import type meta from '../../BaseChat.stories'
import BaseChat from '../../../ui/BaseChat.vue'
import { SHOWCASE_MESSAGES } from '../../shared'
import type { StoryObj } from '@storybook/vue3-vite'
import { literal, SIZE_PRESETS, sizeLabel, storySource, useStorySetup } from '@/stories/helpers'

const presets = SIZE_PRESETS.slice(1, 4).map(preset => ({ name: preset.name, sizeScale: preset.sizeScale, label: sizeLabel(preset) }))

const messages = SHOWCASE_MESSAGES.slice(0, 2)

const template = `
	<div class="story-grid" style="--story-grid-min: 320px;">
		<BaseChat
			v-for="preset in presets"
			:key="preset.name"
			v-bind="args"
			:messages="messages"
			:subtitle="preset.label"
			:size-scale="preset.sizeScale"
			height="360px" />
	</div>
`

const script = `
const presets = ${literal(presets)}
const messages: ChatMessage[] = ${literal(messages)}
`

export const Sizes: StoryObj<typeof meta> = {
	args: { quickReplies: [] },
	parameters: {
		controls: { include: ['variant'] },
		docs: {
			description: {
				story: 'Размеры через `sizeScale`: высота кнопок и поля ввода — 28, 32 и 36px, кегль и отступы — пропорционально.',
			},
			source: storySource({ template, imports: ['BaseChat', 'type ChatMessage'], script }),
		},
	},
	render: args => ({
		components: { BaseChat },
		setup: useStorySetup(args, { data: { presets, messages } }),
		template,
	}),
}
