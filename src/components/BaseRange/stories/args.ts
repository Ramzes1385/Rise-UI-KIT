import { fn } from 'storybook/test'
import type BaseRange from '../ui/BaseRange.vue'
import type { Meta } from '@storybook/vue3-vite'

export const args = {
	modelValue: 40,
	min: 0,
	max: 100,
	step: 1,
	ariaLabel: 'Громкость',
	variant: 'default',
	sizeScale: 100,
	hasLabel: false,
	hasTooltip: false,
	isVertical: false,
	isDisabled: false,
	'onUpdate:modelValue': fn(),
	onChange: fn(),
} satisfies Meta<typeof BaseRange>['args']
