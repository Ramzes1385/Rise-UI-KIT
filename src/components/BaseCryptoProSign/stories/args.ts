import { fn } from 'storybook/test'
import type { Meta } from '@storybook/vue3-vite'
import type BaseCryptoProSign from '../ui/BaseCryptoProSign.vue'

export const args = {
	data: 'Пример',
	isDisabled: false,
	onSigned: fn(),
	variant: 'default',
	sizeScale: 100,
} satisfies Meta<typeof BaseCryptoProSign>['args']
