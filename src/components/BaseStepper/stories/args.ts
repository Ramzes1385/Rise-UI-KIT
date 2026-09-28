import { STEPS } from './shared'
import { fn } from 'storybook/test'
import type { Meta } from '@storybook/vue3-vite'
import type BaseStepper from '../ui/BaseStepper.vue'

export const args = {
	modelValue: 2,
	items: STEPS,
	orientation: 'horizontal',
	shape: 'circle',
	variant: 'default',
	sizeScale: 100,
	'onUpdate:modelValue': fn(),
	onChange: fn(),
} satisfies Meta<typeof BaseStepper>['args']
