import type meta from '../BaseTimePicker.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import { useArgsWithoutSlots } from '@/stories/helpers'
import BaseTimePicker from '../../ui/BaseTimePicker.vue'
import { TIME_PICKER_VARIANTS } from '../../types/BaseTimePicker.types'

export const Variants: StoryObj<typeof meta> = {
	parameters: { docs: { description: { story: 'Варианты поля — как у BaseInput.' } }, controls: { include: ['sizeScale'] } },
	render: args => ({
		components: { BaseTimePicker },
		setup: () => ({ props: useArgsWithoutSlots(args, ['variant', 'label', 'modelValue']), variants: TIME_PICKER_VARIANTS }),
		template: `
			<div class="story-grid" style="--story-grid-min: 160px;">
				<BaseTimePicker v-for="variant in variants" :key="variant" v-bind="props" :variant="variant" :label="variant" model-value="14:30" />
			</div>
		`,
	}),
}
