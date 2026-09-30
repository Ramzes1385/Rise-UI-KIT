import { demoSource } from './shared'
import type { Meta } from '@storybook/vue3-vite'
import type BaseDadataInput from '../ui/BaseDadataInput.vue'

export const args = {
	modelValue: '',
	kind: 'party',
	source: demoSource('party'),
	label: 'Организация',
	placeholder: 'Название, ИНН или ОГРН',
	minChars: 3,
	debounce: 300,
	count: 7,
	isRequired: false,
	isDisabled: false,
	variant: 'default',
	sizeScale: 100,
} satisfies Meta<typeof BaseDadataInput>['args']
