import type { Meta } from '@storybook/vue3-vite'
import type BaseMoneyInput from '../ui/BaseMoneyInput.vue'

export const args = {
	modelValue: 1234.5,
	currency: 'RUB',
	label: 'Сумма',
	min: 0,
	isRequired: false,
	isDisabled: false,
	variant: 'default',
	sizeScale: 100,
} satisfies Meta<typeof BaseMoneyInput>['args']
