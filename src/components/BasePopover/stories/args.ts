import { fn } from 'storybook/test'
import type { Meta } from '@storybook/vue3-vite'
import type BasePopover from '../ui/BasePopover.vue'

export const args = {
	isOpen: false,
	position: 'bottom',
	variant: 'default',
	sizeScale: 100,
	onClose: fn(),
	'onUpdate:isOpen': fn(),
} satisfies Meta<typeof BasePopover>['args']
