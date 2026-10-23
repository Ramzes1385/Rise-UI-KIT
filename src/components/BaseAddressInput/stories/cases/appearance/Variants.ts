import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../BaseAddressInput.stories'
import BaseAddressInput from '../../../ui/BaseAddressInput.vue'
import { literal, storySource, useStorySetup } from '@/stories/helpers'
import { ADDRESS_INPUT_VARIANTS } from '../../../types/BaseAddressInput.types'

const variants = ADDRESS_INPUT_VARIANTS

const template = `
	<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px">
		<BaseAddressInput v-for="variant in variants" :key="variant" v-bind="args" :variant="variant" :label="variant" />
	</div>
`

export const Variants: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: { story: 'Варианты оформления — как у BaseInput. Размер из Controls применяется ко всем.' },
			source: storySource({ template, imports: ['BaseAddressInput'], script: `const variants = ${literal(variants)}` }),
		},
		controls: { include: ['sizeScale'] },
	},
	args: { modelValue: 'г Москва, ул Тверская, д 7' },
	render: args => ({
		components: { BaseAddressInput },
		setup: useStorySetup(args, { data: { variants } }),
		template,
	}),
}
