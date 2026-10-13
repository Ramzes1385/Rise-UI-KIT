import { fn } from 'storybook/test'
import { DOCUMENT_TEXT } from './shared'
import type { Meta } from '@storybook/vue3-vite'
import type BaseCryptoProSign from '../ui/BaseCryptoProSign.vue'

export const args = {
	data: DOCUMENT_TEXT,
	fileName: 'act',
	isDisabled: false,
	onSigned: fn(),
	'onSigned-all': fn(),
	onVerified: fn(),
	onError: fn(),
	variant: 'default',
	sizeScale: 100,
} satisfies Meta<typeof BaseCryptoProSign>['args']
