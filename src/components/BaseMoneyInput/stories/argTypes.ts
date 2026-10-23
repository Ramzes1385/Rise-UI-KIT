import type { Meta } from '@storybook/vue3-vite'
import type BaseMoneyInput from '../ui/BaseMoneyInput.vue'
import { MONEY_INPUT_VARIANTS } from '../types/BaseMoneyInput.types'
import { ARG_GROUP, baseArgTypes, propGroup } from '@/stories/helpers'

export const argTypes = {
	...baseArgTypes({ variants: MONEY_INPUT_VARIANTS }),
	modelValue: { control: 'number', table: propGroup(ARG_GROUP.content) },
	currency: { control: 'select', options: ['RUB', 'USD', 'EUR', 'KZT', 'BYN', 'CNY', 'JPY'], table: propGroup(ARG_GROUP.content) },
	min: { control: 'number', table: propGroup(ARG_GROUP.behavior) },
	max: { control: 'number', table: propGroup(ARG_GROUP.behavior) },
	label: { control: 'text', table: propGroup(ARG_GROUP.content) },
	placeholder: { control: 'text', table: propGroup(ARG_GROUP.content) },
	error: { control: 'text', table: propGroup(ARG_GROUP.state) },
	isRequired: { control: 'boolean', table: propGroup(ARG_GROUP.state) },
	isDisabled: { control: 'boolean', table: propGroup(ARG_GROUP.state) },
} satisfies Meta<typeof BaseMoneyInput>['argTypes']
