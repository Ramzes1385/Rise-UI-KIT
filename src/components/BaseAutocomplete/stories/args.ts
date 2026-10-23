import { CITIES } from './shared'
import { fn } from 'storybook/test'
import type { Meta } from '@storybook/vue3-vite'
import type BaseAutocomplete from '../ui/BaseAutocomplete.vue'

export const args = {
	modelValue: null,
	options: CITIES,
	label: 'Город доставки',
	placeholder: 'Начните вводить город',
	isCustomAllowed: false,
	isRemote: false,
	isLoading: false,
	isDisabled: false,
	isReadonly: false,
	isRequired: false,
	variant: 'default',
	sizeScale: 100,
	onChange: fn(),
} satisfies Meta<typeof BaseAutocomplete>['args']
