import type meta from '../BaseAutocomplete.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import { useArgsWithoutSlots } from '@/stories/helpers'
import BaseAutocomplete from '../../ui/BaseAutocomplete.vue'
import { AUTOCOMPLETE_VARIANTS } from '../../types/BaseAutocomplete.types'

export const Variants: StoryObj<typeof meta> = {
	parameters: { docs: { description: { story: 'Варианты поля — как у BaseInput.' } }, controls: { include: ['sizeScale'] } },
	render: args => ({
		components: { BaseAutocomplete },
		setup: () => ({ props: useArgsWithoutSlots(args, ['variant', 'label', 'modelValue']), variants: AUTOCOMPLETE_VARIANTS }),
		template: `
			<div class="story-grid" style="--story-grid-min: 220px;">
				<BaseAutocomplete v-for="variant in variants" :key="variant" v-bind="props" :variant="variant" :label="variant" model-value="spb" />
			</div>
		`,
	}),
}
