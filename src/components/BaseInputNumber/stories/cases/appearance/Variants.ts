import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../BaseInputNumber.stories'
import { useArgsWithoutSlots } from '@/stories/helpers'
import BaseInputNumber from '../../../ui/BaseInputNumber.vue'
import { INPUT_NUMBER_VARIANTS } from '../../../types/BaseInputNumber.types'

export const Variants: StoryObj<typeof meta> = {
	parameters: { docs: { description: { story: 'Варианты — как у BaseInput.' } }, controls: { include: ['sizeScale', 'hasControls'] } },
	render: args => ({
		components: { BaseInputNumber },
		setup: () => ({ props: useArgsWithoutSlots(args, ['variant', 'label', 'modelValue']), variants: INPUT_NUMBER_VARIANTS }),
		template: `
			<div class="story-grid" style="--story-grid-min: 160px;">
				<BaseInputNumber v-for="variant in variants" :key="variant" v-bind="props" :variant="variant" :label="variant" :model-value="4" />
			</div>
		`,
	}),
}
