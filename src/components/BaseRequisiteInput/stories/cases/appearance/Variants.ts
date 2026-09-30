import type { StoryObj } from '@storybook/vue3-vite'
import { useArgsWithoutSlots } from '@/stories/helpers'
import type meta from '../../BaseRequisiteInput.stories'
import BaseRequisiteInput from '../../../ui/BaseRequisiteInput.vue'
import { REQUISITE_INPUT_VARIANTS } from '../../../types/BaseRequisiteInput.types'

export const Variants: StoryObj<typeof meta> = {
	parameters: {
		docs: { description: { story: 'Варианты оформления — как у BaseInput. Размер из Controls применяется ко всем.' } },
		controls: { include: ['sizeScale'] },
	},
	args: { modelValue: '7707083893' },
	render: args => ({
		components: { BaseRequisiteInput },
		setup: () => ({ props: useArgsWithoutSlots(args), variants: REQUISITE_INPUT_VARIANTS }),
		template: `
			<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 16px">
				<BaseRequisiteInput v-for="variant in variants" :key="variant" v-bind="props" :variant="variant" :label="variant" />
			</div>`,
	}),
}
