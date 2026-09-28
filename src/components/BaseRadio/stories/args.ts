import { fn } from 'storybook/test'
import { DELIVERY_OPTIONS } from './shared'
import type BaseRadio from '../ui/BaseRadio.vue'
import type { Meta } from '@storybook/vue3-vite'

export const args = {
	modelValue: 'courier',
	options: DELIVERY_OPTIONS,
	name: 'delivery',
	label: 'Способ доставки',
	variant: 'default',
	sizeScale: 100,
	isVertical: false,
	isRequired: false,
	error: '',
	'onUpdate:modelValue': fn(),
	onChange: fn(),
} satisfies Meta<typeof BaseRadio>['args']
