import type meta from '../../BasePhoneInput.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import { useArgsWithoutSlots } from '@/stories/helpers'
import BasePhoneInput from '../../../ui/BasePhoneInput.vue'
import { PHONE_INPUT_VARIANTS } from '../../../types/BasePhoneInput.types'

export const Variants: StoryObj<typeof meta> = {
	parameters: {
		docs: { description: { story: 'Варианты оформления — как у BaseInput. Размер из Controls применяется ко всем.' } },
		controls: { include: ['sizeScale'] },
	},
	args: { modelValue: '+79161234567' },
	render: args => ({
		components: { BasePhoneInput },
		setup: () => ({ props: useArgsWithoutSlots(args), variants: PHONE_INPUT_VARIANTS }),
		template: `
			<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 16px">
				<BasePhoneInput v-for="variant in variants" :key="variant" v-bind="props" :variant="variant" :label="variant" />
			</div>`,
	}),
}
