import type meta from '../../BaseMoneyInput.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import { useArgsWithoutSlots } from '@/stories/helpers'
import BaseMoneyInput from '../../../ui/BaseMoneyInput.vue'
import { MONEY_INPUT_VARIANTS } from '../../../types/BaseMoneyInput.types'

export const Variants: StoryObj<typeof meta> = {
	parameters: {
		docs: { description: { story: 'Варианты оформления — как у BaseInput. Размер из Controls применяется ко всем.' } },
		controls: { include: ['sizeScale'] },
	},
	render: args => ({
		components: { BaseMoneyInput },
		setup: () => ({ props: useArgsWithoutSlots(args), variants: MONEY_INPUT_VARIANTS }),
		template: `
			<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 16px">
				<BaseMoneyInput v-for="variant in variants" :key="variant" v-bind="props" :variant="variant" :label="variant" />
			</div>`,
	}),
}
