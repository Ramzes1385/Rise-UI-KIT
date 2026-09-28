import { fn } from 'storybook/test'
import type { Meta } from '@storybook/vue3-vite'
import type BaseCheckbox from '../ui/BaseCheckbox.vue'

export const args = {
	modelValue: false,
	label: 'Получать новости и специальные предложения',
	variant: 'default',
	sizeScale: 100,
	error: '',
	isDisabled: false,
	'onUpdate:modelValue': fn(),
	onChange: fn(),
} satisfies Meta<typeof BaseCheckbox>['args']
