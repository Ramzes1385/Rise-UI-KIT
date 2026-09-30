import { demoSource } from './shared'
import type { Meta } from '@storybook/vue3-vite'
import type BaseAddressInput from '../ui/BaseAddressInput.vue'

export const args = {
	modelValue: '',
	source: demoSource,
	label: 'Адрес доставки',
	placeholder: 'Город, улица, дом',
	minChars: 3,
	debounce: 300,
	isRequired: false,
	isDisabled: false,
	variant: 'default',
	sizeScale: 100,
} satisfies Meta<typeof BaseAddressInput>['args']
