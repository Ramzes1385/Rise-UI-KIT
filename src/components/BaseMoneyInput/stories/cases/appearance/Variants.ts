import type meta from '../../BaseMoneyInput.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseMoneyInput from '../../../ui/BaseMoneyInput.vue'
import { literal, storySource, useStorySetup } from '@/stories/helpers'
import { MONEY_INPUT_VARIANTS } from '../../../types/BaseMoneyInput.types'

const variants = MONEY_INPUT_VARIANTS

const template = `
	<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 16px">
		<BaseMoneyInput v-for="variant in variants" :key="variant" v-bind="args" :variant="variant" :label="variant" />
	</div>
`

export const Variants: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: { story: 'Варианты оформления — как у BaseInput. Размер из Controls применяется ко всем.' },
			source: storySource({ template, imports: ['BaseMoneyInput'], script: `const variants = ${literal(variants)}` }),
		},
		controls: { include: ['sizeScale'] },
	},
	render: args => ({
		components: { BaseMoneyInput },
		setup: useStorySetup(args, { data: { variants } }),
		template,
	}),
}
