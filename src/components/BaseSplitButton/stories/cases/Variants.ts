import type meta from '../BaseSplitButton.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import { useArgsWithoutSlots } from '@/stories/helpers'
import BaseSplitButton from '../../ui/BaseSplitButton.vue'
import { SPLIT_BUTTON_VARIANTS } from '../../types/BaseSplitButton.types'

export const Variants: StoryObj<typeof meta> = {
	parameters: { docs: { description: { story: 'Варианты — как у BaseButton.' } }, controls: { include: ['sizeScale'] } },
	render: args => ({
		components: { BaseSplitButton },
		setup: () => ({ props: useArgsWithoutSlots(args, ['variant']), variants: SPLIT_BUTTON_VARIANTS }),
		template:
			'<div class="story-row"><BaseSplitButton v-for="variant in variants" :key="variant" v-bind="props" :variant="variant" /></div>',
	}),
}
