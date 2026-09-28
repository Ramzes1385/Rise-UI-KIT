import { UI_TEXT } from '@/locales/messages'
import type { Meta } from '@storybook/vue3-vite'
import type BaseLoader from '../ui/BaseLoader.vue'

export const args = {
	variant: 'spinner',
	label: UI_TEXT.LOADING,
	hasLabel: false,
	isOverlay: false,
	sizeScale: 100,
} satisfies Meta<typeof BaseLoader>['args']
