import { fn } from 'storybook/test'
import type BaseInput from '../ui/BaseInput.vue'
import type { Meta } from '@storybook/vue3-vite'

export const args = {
	modelValue: '',
	label: 'Email',
	placeholder: 'name@example.com',
	type: 'email',
	variant: 'default',
	sizeScale: 100,
	isRequired: false,
	isDisabled: false,
	isReadonly: false,
	'onUpdate:modelValue': fn(),
} satisfies Meta<typeof BaseInput>['args']
