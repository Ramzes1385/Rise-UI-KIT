import type meta from '../BaseAudioPlayer.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseAudioPlayer from '../../ui/BaseAudioPlayer.vue'
import { SIZE_PRESETS, sizeLabel } from '@/stories/helpers'

export const Sizes: StoryObj<typeof meta> = {
	parameters: {
		docs: { description: { story: 'Размеры через `sizeScale`: 75 / 87.5 / 100 / 112.5 / 125.' } },
		controls: { include: ['variant'] },
	},
	render: args => ({
		components: { BaseAudioPlayer },
		setup: () => ({ args, presets: SIZE_PRESETS, sizeLabel }),
		template:
			'<div class="story-col" style="gap: 12px; max-width: 420px;"><BaseAudioPlayer v-for="preset in presets" :key="preset.name" v-bind="args" :size-scale="preset.sizeScale" :title="sizeLabel(preset)" /></div>',
	}),
}
