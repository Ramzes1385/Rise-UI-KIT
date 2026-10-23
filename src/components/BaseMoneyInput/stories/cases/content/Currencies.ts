import type meta from '../../BaseMoneyInput.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseMoneyInput from '../../../ui/BaseMoneyInput.vue'
import { literal, storySource, useStorySetup } from '@/stories/helpers'

const currencies = ['RUB', 'USD', 'EUR', 'KZT', 'JPY']

const template = `
	<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 16px">
		<BaseMoneyInput v-for="currency in currencies" :key="currency" v-bind="args" :currency="currency" :label="currency" :model-value="1234567.891" />
	</div>
`

export const Currencies: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: { story: 'Знак и число знаков после запятой — по валюте: рубль, доллар, евро, тенге и иена без копеек.' },
			source: storySource({ template, imports: ['BaseMoneyInput'], script: `const currencies = ${literal(currencies)}` }),
		},
		controls: { include: ['variant', 'sizeScale'] },
	},
	render: args => ({
		components: { BaseMoneyInput },
		setup: useStorySetup(args, { data: { currencies } }),
		template,
	}),
}
