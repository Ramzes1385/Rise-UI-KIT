import { fn } from 'storybook/test'
import type BasePin from '../ui/BasePin.vue'
import type { Meta } from '@storybook/vue3-vite'

export const args = {
	modelValue: '',
	length: 4,
	type: 'text',
	variant: 'default',
	sizeScale: 100,
	error: '',
	isDisabled: false,
	'onUpdate:modelValue': fn(),
	onComplete: fn(),
} satisfies Meta<typeof BasePin>['args']
