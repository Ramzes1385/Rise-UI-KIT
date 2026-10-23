import { fn } from 'storybook/test'
import type { Meta } from '@storybook/vue3-vite'
import type BaseSplitter from '../ui/BaseSplitter.vue'

export const args = {
	modelValue: 35,
	orientation: 'horizontal',
	min: 20,
	max: 80,
	step: 5,
	label: 'Список писем',
	isDisabled: false,
	variant: 'default',
	sizeScale: 100,
	onChange: fn(),
} satisfies Meta<typeof BaseSplitter>['args']
