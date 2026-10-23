import type meta from '../BaseAutocomplete.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseAutocomplete from '../../ui/BaseAutocomplete.vue'
import { literal, storySource, useStorySetup } from '@/stories/helpers'
import { AUTOCOMPLETE_VARIANTS } from '../../types/BaseAutocomplete.types'

const variants = AUTOCOMPLETE_VARIANTS

const template = `
	<div class="story-grid" style="--story-grid-min: 220px;">
		<BaseAutocomplete v-for="variant in variants" :key="variant" v-bind="args" :variant="variant" :label="variant" model-value="spb" />
	</div>
`

export const Variants: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: { story: 'Варианты поля — как у BaseInput.' },
			source: storySource({
				template,
				imports: ['BaseAutocomplete'],
				script: `const variants = ${literal(variants)}`,
				omit: ['variant', 'label', 'modelValue'],
			}),
		},
		controls: { include: ['sizeScale'] },
	},
	render: args => ({
		components: { BaseAutocomplete },
		setup: useStorySetup(args, { data: { variants }, slots: ['variant', 'label', 'modelValue'] }),
		template,
	}),
}
