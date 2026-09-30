import type meta from '../../BaseMoneyInput.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import { useArgsWithoutSlots } from '@/stories/helpers'
import BaseMoneyInput from '../../../ui/BaseMoneyInput.vue'

export const Currencies: StoryObj<typeof meta> = {
	parameters: {
		docs: { description: { story: 'Знак и число знаков после запятой — по валюте: рубль, доллар, евро, тенге и иена без копеек.' } },
		controls: { include: ['variant', 'sizeScale'] },
	},
	render: args => ({
		components: { BaseMoneyInput },
		setup: () => ({ props: useArgsWithoutSlots(args), currencies: ['RUB', 'USD', 'EUR', 'KZT', 'JPY'] }),
		template: `
			<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 16px">
				<BaseMoneyInput v-for="currency in currencies" :key="currency" v-bind="props" :currency="currency" :label="currency" :model-value="1234567.891" />
			</div>`,
	}),
}
