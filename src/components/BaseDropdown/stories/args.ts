import { fn } from 'storybook/test'
import type { Meta } from '@storybook/vue3-vite'
import type BaseDropdown from '../ui/BaseDropdown.vue'

export const args = {
	isOpen: false,
	position: 'bottom-start',
	variant: 'default',
	gap: 4,
	maxHeight: '320px',
	matchWidth: false,
	closeOnEscape: true,
	preventMousedown: true,
	sizeScale: 100,
	onClose: fn(),
	'onUpdate:isOpen': fn(),
} satisfies Meta<typeof BaseDropdown>['args']
