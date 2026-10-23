import { fn } from 'storybook/test'
import type { Meta } from '@storybook/vue3-vite'
import type BaseDatePicker from '../ui/BaseDatePicker.vue'

export const args = {
	modelValue: null,
	label: 'Дата встречи',
	placeholder: 'Выберите дату',
	selectionMode: 'single',
	inputVariant: 'default',
	calendarVariant: 'ghost',
	sizeScale: 100,
	isRequired: false,
	isDisabled: false,
	isClearable: false,
	'onUpdate:modelValue': fn(),
	onOpen: fn(),
	onClose: fn(),
} satisfies Meta<typeof BaseDatePicker>['args']
