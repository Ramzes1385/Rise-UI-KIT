import type meta from '../../BasePhoneInput.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BasePhoneInput from '../../../ui/BasePhoneInput.vue'
import { storySource, useStorySetup } from '@/stories/helpers'
import { PHONE_INPUT_VARIANTS } from '../../../types/BasePhoneInput.types'

const template = `
	<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 16px">
		<BasePhoneInput v-for="variant in PHONE_INPUT_VARIANTS" :key="variant" v-bind="args" :variant="variant" :label="variant" />
	</div>
`

export const Variants: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: { story: 'Варианты оформления — как у BaseInput. Размер из Controls применяется ко всем.' },
			source: storySource({ template, imports: ['BasePhoneInput', 'PHONE_INPUT_VARIANTS'], omit: ['variant', 'label'] }),
		},
		controls: { include: ['sizeScale'] },
	},
	args: { modelValue: '+79161234567' },
	render: args => ({
		components: { BasePhoneInput },
		setup: useStorySetup(args, { data: { PHONE_INPUT_VARIANTS } }),
		template,
	}),
}
