import { fn } from 'storybook/test'
import type { Meta } from '@storybook/vue3-vite'
import type BaseInputNumber from '../ui/BaseInputNumber.vue'

export const args = {
	modelValue: 2,
	label: 'Гостей',
	min: 1,
	max: 10,
	step: 1,
	hasControls: true,
	isDisabled: false,
	isReadonly: false,
	isRequired: false,
	variant: 'default',
	sizeScale: 100,
	onChange: fn(),
} satisfies Meta<typeof BaseInputNumber>['args']
