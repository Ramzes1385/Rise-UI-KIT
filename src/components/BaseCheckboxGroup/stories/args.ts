import { fn } from 'storybook/test'
import type { Meta } from '@storybook/vue3-vite'
import type BaseCheckboxGroup from '../ui/BaseCheckboxGroup.vue'
import type { CheckboxGroupOption } from '../types/BaseCheckboxGroup.types'

const CHANNELS: CheckboxGroupOption[] = [
	{ value: 'email', label: 'Электронная почта' },
	{ value: 'push', label: 'Push-уведомления' },
	{ value: 'telegram', label: 'Telegram' },
	{ value: 'sms', label: 'SMS — в тарифе «Бизнес»', isDisabled: true },
]

export const args = {
	modelValue: ['email'],
	options: CHANNELS,
	label: 'Каналы уведомлений',
	isVertical: false,
	hasSelectAll: false,
	isRequired: false,
	isDisabled: false,
	variant: 'default',
	sizeScale: 100,
	onChange: fn(),
} satisfies Meta<typeof BaseCheckboxGroup>['args']
