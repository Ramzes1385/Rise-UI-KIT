import { fn } from 'storybook/test'
import type { Meta } from '@storybook/vue3-vite'
import type BaseTimePicker from '../ui/BaseTimePicker.vue'

export const args = {
	modelValue: null,
	label: 'Время звонка',
	step: 30,
	minTime: '09:00',
	maxTime: '18:00',
	isDisabled: false,
	isRequired: false,
	variant: 'default',
	sizeScale: 100,
	onChange: fn(),
} satisfies Meta<typeof BaseTimePicker>['args']
