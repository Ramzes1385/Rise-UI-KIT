import { FRAME } from '../shared'
import BaseFab from '../../ui/BaseFab.vue'
import type meta from '../BaseFab.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import type { FabPosition } from '../../types/BaseFab.types'
import { useArgsWithoutSlots, SIZE_PRESETS, sizeLabel } from '@/stories/helpers'

export const Sizes: StoryObj<typeof meta> = {
	parameters: { docs: { description: { story: 'Размеры через `sizeScale`: 42, 56 и 70px.' } }, controls: { include: ['variant'] } },
	render: args => ({
		components: { BaseFab },
		setup: () => ({
			props: useArgsWithoutSlots(args, ['sizeScale', 'position', 'label']),
			presets: SIZE_PRESETS.filter(preset => ['xs', 'md', 'xl'].includes(preset.name)),
			sizeLabel,
			frame: FRAME,
			positions: ['bottom-left', 'top-left', 'bottom-right'] as FabPosition[],
		}),
		template:
			'<div :style="frame"><BaseFab v-for="(preset, index) in presets" :key="preset.name" v-bind="props" :size-scale="preset.sizeScale" :position="positions[index]" :label="sizeLabel(preset)" /></div>',
	}),
}
