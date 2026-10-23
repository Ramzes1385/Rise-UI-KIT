import { fn } from 'storybook/test'
import type { Meta } from '@storybook/vue3-vite'
import type BaseRating from '../ui/BaseRating.vue'

export const args = {
	modelValue: 3,
	max: 5,
	step: 1,
	icon: 'star',
	isHoverSmooth: true,
	isValueShown: false,
	variant: 'default',
	sizeScale: 100,
	isReadonly: false,
	isDisabled: false,
	'onUpdate:modelValue': fn(),
	onChange: fn(),
} satisfies Meta<typeof BaseRating>['args']
