import { fn } from 'storybook/test'
import type { Meta } from '@storybook/vue3-vite'
import type BaseSlideover from '../ui/BaseSlideover.vue'

export const args = {
	isOpen: false,
	title: 'Фильтры',
	variant: 'default',
	side: 'right',
	width: 100,
	isFullWidth: false,
	hasOverlay: true,
	sizeScale: 100,
	closeOnOverlay: true,
	closeOnEscape: true,
	isContained: false,
	onClose: fn(),
	'onUpdate:isOpen': fn(),
} satisfies Meta<typeof BaseSlideover>['args']
