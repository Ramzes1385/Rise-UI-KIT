import { FRAME } from '../shared'
import BaseFab from '../../ui/BaseFab.vue'
import type meta from '../BaseFab.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import { useArgsWithoutSlots } from '@/stories/helpers'
import { FAB_VARIANTS } from '../../types/BaseFab.types'
import type { FabPosition } from '../../types/BaseFab.types'

export const Variants: StoryObj<typeof meta> = {
	parameters: {
		docs: { description: { story: 'Варианты: `default` — заливка, `soft` — мягкий цвет, `outline` — рамка.' } },
		controls: { include: ['sizeScale', 'isExtended'] },
	},
	render: args => ({
		components: { BaseFab },
		setup: () => ({
			props: useArgsWithoutSlots(args, ['variant', 'position']),
			variants: FAB_VARIANTS,
			frame: FRAME,
			positions: ['bottom-left', 'bottom-right', 'top-left'] as FabPosition[],
		}),
		template:
			'<div :style="frame"><BaseFab v-for="(variant, index) in variants" :key="variant" v-bind="props" :variant="variant" :position="positions[index]" :label="variant" /></div>',
	}),
}
