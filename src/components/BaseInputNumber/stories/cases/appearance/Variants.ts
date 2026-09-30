import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../BaseInputNumber.stories'
import BaseInputNumber from '../../../ui/BaseInputNumber.vue'
import { literal, storySource, useStorySetup } from '@/stories/helpers'
import { INPUT_NUMBER_VARIANTS } from '../../../types/BaseInputNumber.types'

const variants = INPUT_NUMBER_VARIANTS

const template = `
	<div class="story-grid" style="--story-grid-min: 160px;">
		<BaseInputNumber v-for="variant in variants" :key="variant" v-bind="args" :variant="variant" :label="variant" :model-value="4" />
	</div>
`

export const Variants: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: { story: 'Варианты — как у BaseInput.' },
			source: storySource({
				template,
				imports: ['BaseInputNumber'],
				script: `const variants = ${literal(variants)}`,
				omit: ['variant', 'label', 'modelValue'],
			}),
		},
		controls: { include: ['sizeScale', 'hasControls'] },
	},
	render: args => ({
		components: { BaseInputNumber },
		setup: useStorySetup(args, { data: { variants }, slots: ['variant', 'label', 'modelValue'] }),
		template,
	}),
}
