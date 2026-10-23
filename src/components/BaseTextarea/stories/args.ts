import { fn } from 'storybook/test'
import type { Meta } from '@storybook/vue3-vite'
import type BaseTextarea from '../ui/BaseTextarea.vue'

export const args = {
	modelValue: '',
	label: 'Комментарий к заказу',
	placeholder: 'Например, код домофона или удобное время доставки',
	rows: 4,
	variant: 'default',
	sizeScale: 100,
	isAutosize: false,
	isRequired: false,
	isDisabled: false,
	isReadonly: false,
	'onUpdate:modelValue': fn(),
	onFocus: fn(),
	onBlur: fn(),
} satisfies Meta<typeof BaseTextarea>['args']
