import { fn } from 'storybook/test'
import { CATEGORIES } from './shared'
import type { Meta } from '@storybook/vue3-vite'
import type BaseCookieConsent from '../ui/BaseCookieConsent.vue'

export const args = {
	categories: CATEGORIES,
	isOpen: true,
	isSettingsOpen: false,
	position: 'bottom',
	isContained: true,
	variant: 'default',
	sizeScale: 100,
	onAccept: fn(),
	onChange: fn(),
} satisfies Meta<typeof BaseCookieConsent>['args']
