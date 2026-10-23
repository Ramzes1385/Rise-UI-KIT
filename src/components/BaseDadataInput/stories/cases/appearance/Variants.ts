import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../BaseDadataInput.stories'
import BaseDadataInput from '../../../ui/BaseDadataInput.vue'
import { literal, storySource, useStorySetup } from '@/stories/helpers'
import { DADATA_INPUT_VARIANTS } from '../../../types/BaseDadataInput.types'

const variants = DADATA_INPUT_VARIANTS

const template = `
	<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px">
		<BaseDadataInput v-for="variant in variants" :key="variant" v-bind="args" :variant="variant" :label="variant" />
	</div>
`

export const Variants: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: { story: 'Варианты оформления — как у BaseInput. Размер из Controls применяется ко всем.' },
			source: storySource({ template, imports: ['BaseDadataInput'], script: `const variants = ${literal(variants)}` }),
		},
		controls: { include: ['sizeScale'] },
	},
	args: { modelValue: 'ООО "ЯНДЕКС"' },
	render: args => ({
		components: { BaseDadataInput },
		setup: useStorySetup(args, { data: { variants } }),
		template,
	}),
}
