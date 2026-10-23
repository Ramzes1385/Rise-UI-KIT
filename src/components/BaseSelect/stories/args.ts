import { fn } from 'storybook/test'
import type { Meta } from '@storybook/vue3-vite'
import type BaseSelect from '../ui/BaseSelect.vue'
import type { BaseSelectOption } from '../types/BaseSelect.types'

const CITIES: BaseSelectOption[] = [
	{ value: 'msk', label: 'Москва' },
	{ value: 'spb', label: 'Санкт-Петербург' },
	{ value: 'kzn', label: 'Казань' },
	{ value: 'nsk', label: 'Новосибирск' },
	{ value: 'ekb', label: 'Екатеринбург', isDisabled: true },
]

export const args = {
	modelValue: '',
	options: CITIES,
	label: 'Город доставки',
	placeholder: 'Выберите город',
	variant: 'default',
	sizeScale: 100,
	isMultiple: false,
	isSearchable: false,
	isRequired: false,
	isDisabled: false,
	'onUpdate:modelValue': fn(),
	onChange: fn(),
} satisfies Meta<typeof BaseSelect>['args']
