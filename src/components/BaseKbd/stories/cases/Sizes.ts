import BaseKbd from '../../ui/BaseKbd.vue'
import type meta from '../BaseKbd.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import { useArgsWithoutSlots, SIZE_PRESETS, sizeLabel } from '@/stories/helpers'

export const Sizes: StoryObj<typeof meta> = {
	parameters: { docs: { description: { story: 'Размеры через `sizeScale`.' } }, controls: { include: ['variant'] } },
	render: args => ({
		components: { BaseKbd },
		setup: () => ({ props: useArgsWithoutSlots(args, ['sizeScale']), presets: SIZE_PRESETS, sizeLabel }),
		template:
			'<div class="story-row"><span v-for="preset in presets" :key="preset.name" class="story-row" style="gap: 4px;"><BaseKbd v-bind="props" :size-scale="preset.sizeScale" /><span class="story-label">{{ sizeLabel(preset) }}</span></span></div>',
	}),
}
