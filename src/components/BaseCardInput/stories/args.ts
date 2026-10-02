import type { Meta } from '@storybook/vue3-vite'
import type BaseCardInput from '../ui/BaseCardInput.vue'

export const args = {
	modelValue: null,
	label: 'Оплата картой',
	layout: 'stacked',
	isDisabled: false,
	variant: 'default',
	sizeScale: 100,
} satisfies Meta<typeof BaseCardInput>['args']
