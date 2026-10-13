import { MESSAGES } from './shared'
import { fn } from 'storybook/test'
import type { Meta } from '@storybook/vue3-vite'
import type BaseBanner from '../ui/BaseBanner.vue'

export const args = {
	type: 'primary',
	variant: 'default',
	text: MESSAGES.primary,
	hasIcon: true,
	isClosable: false,
	isOpen: true,
	position: 'static',
	sizeScale: 100,
	'onUpdate:isOpen': fn(),
	onClose: fn(),
} satisfies Meta<typeof BaseBanner>['args']
