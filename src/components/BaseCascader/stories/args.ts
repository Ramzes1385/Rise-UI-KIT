import { REGIONS } from './shared'
import { fn } from 'storybook/test'
import type { Meta } from '@storybook/vue3-vite'
import type BaseCascader from '../ui/BaseCascader.vue'

export const args = {
	modelValue: [],
	items: REGIONS,
	label: 'Район доставки',
	placeholder: 'Выберите район',
	separator: ' / ',
	variant: 'default',
	sizeScale: 100,
	isMultiple: false,
	isSearchable: false,
	isAnyLevel: false,
	isLoading: false,
	isRequired: false,
	isDisabled: false,
	'onUpdate:modelValue': fn(),
	onChange: fn(),
	'onLoad-error': fn(),
} satisfies Meta<typeof BaseCascader>['args']
