import { fn } from 'storybook/test'
import type { Meta } from '@storybook/vue3-vite'
import type BasePhoneInput from '../ui/BasePhoneInput.vue'

export const args = {
	modelValue: '',
	country: 'RU',
	label: 'Телефон',
	isRequired: false,
	isDisabled: false,
	variant: 'default',
	sizeScale: 100,
	'onUpdate:country': fn(),
} satisfies Meta<typeof BasePhoneInput>['args']
