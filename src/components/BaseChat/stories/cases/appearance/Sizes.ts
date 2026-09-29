import type meta from '../../BaseChat.stories'
import BaseChat from '../../../ui/BaseChat.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { SIZE_PRESETS, sizeLabel } from '@/stories/helpers'
import { SHOWCASE_MESSAGES, PRIVATE_CHAT } from '../../shared'

export const Sizes: StoryObj<typeof meta> = {
	parameters: {
		controls: { include: ['variant'] },
		docs: {
			description: {
				story: 'Размеры через `sizeScale`: высота кнопок и поля ввода — 28, 32 и 36px, кегль и отступы — пропорционально.',
			},
			source: {
				code: SIZE_PRESETS.slice(1, 4)
					.map(p => `<BaseChat :messages="messages" title="Анна Смирнова" :size-scale="${p.sizeScale}" />`)
					.join('\n'),
			},
		},
	},
	render: args => ({
		components: { BaseChat },
		setup: () => ({
			variant: args.variant,
			presets: SIZE_PRESETS.slice(1, 4),
			sizeLabel,
			messages: SHOWCASE_MESSAGES.slice(0, 2),
			chat: PRIVATE_CHAT,
		}),
		template: `
			<div class="story-grid" style="--story-grid-min: 320px;">
				<BaseChat
					v-for="preset in presets"
					:key="preset.name"
					v-bind="chat"
					:messages="messages"
					:variant="variant"
					:subtitle="sizeLabel(preset)"
					:size-scale="preset.sizeScale"
					height="360px" />
			</div>
		`,
	}),
}
