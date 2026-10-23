import { fn } from 'storybook/test'
import type { Meta } from '@storybook/vue3-vite'
import type BaseSwitch from '../ui/BaseSwitch.vue'

export const args = {
	modelValue: false,
	label: 'Уведомления по email',
	variant: 'default',
	sizeScale: 100,
	reverse: false,
	error: '',
	isRequired: false,
	isDisabled: false,
	'onUpdate:modelValue': fn(),
	onChange: fn(),
} satisfies Meta<typeof BaseSwitch>['args']
