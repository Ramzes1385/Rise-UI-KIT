import type meta from '../BaseWaveform.stories'
import BaseWaveform from '../../ui/BaseWaveform.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { SIZE_PRESETS, sizeLabel } from '@/stories/helpers'

export const Sizes: StoryObj<typeof meta> = {
	parameters: {
		docs: { description: { story: 'Высота и промежутки между столбиками масштабируются `sizeScale`: 75 / 87.5 / 100 / 112.5 / 125.' } },
		controls: { include: ['variant'] },
	},
	render: args => ({
		components: { BaseWaveform },
		setup: () => ({ args, presets: SIZE_PRESETS, sizeLabel }),
		template:
			'<div class="story-col" style="gap: 12px; max-width: 420px;"><BaseWaveform v-for="preset in presets" :key="preset.name" v-bind="args" :size-scale="preset.sizeScale" :label="sizeLabel(preset)" /></div>',
	}),
}
