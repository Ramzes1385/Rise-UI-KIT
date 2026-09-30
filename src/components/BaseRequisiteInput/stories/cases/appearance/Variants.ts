import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../BaseRequisiteInput.stories'
import BaseRequisiteInput from '../../../ui/BaseRequisiteInput.vue'
import { literal, storySource, useStorySetup } from '@/stories/helpers'
import { REQUISITE_INPUT_VARIANTS } from '../../../types/BaseRequisiteInput.types'

const variants = REQUISITE_INPUT_VARIANTS

const template = `
	<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 16px">
		<BaseRequisiteInput v-for="variant in variants" :key="variant" v-bind="args" :variant="variant" :label="variant" />
	</div>
`

export const Variants: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: { story: 'Варианты оформления — как у BaseInput. Размер из Controls применяется ко всем.' },
			source: storySource({ template, imports: ['BaseRequisiteInput'], script: `const variants = ${literal(variants)}` }),
		},
		controls: { include: ['sizeScale'] },
	},
	args: { modelValue: '7707083893' },
	render: args => ({
		components: { BaseRequisiteInput },
		setup: useStorySetup(args, { data: { variants } }),
		template,
	}),
}
