import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../BaseAddressInput.stories'
import { useArgsWithoutSlots } from '@/stories/helpers'
import BaseAddressInput from '../../../ui/BaseAddressInput.vue'
import { ADDRESS_INPUT_VARIANTS } from '../../../types/BaseAddressInput.types'

export const Variants: StoryObj<typeof meta> = {
	parameters: {
		docs: { description: { story: 'Варианты оформления — как у BaseInput. Размер из Controls применяется ко всем.' } },
		controls: { include: ['sizeScale'] },
	},
	args: { modelValue: 'г Москва, ул Тверская, д 7' },
	render: args => ({
		components: { BaseAddressInput },
		setup: () => ({ props: useArgsWithoutSlots(args), variants: ADDRESS_INPUT_VARIANTS }),
		template: `
			<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px">
				<BaseAddressInput v-for="variant in variants" :key="variant" v-bind="props" :variant="variant" :label="variant" />
			</div>`,
	}),
}
