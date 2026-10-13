import { fn } from 'storybook/test'
import type { Meta } from '@storybook/vue3-vite'
import type BaseHoverCard from '../ui/BaseHoverCard.vue'

export const args = {
	isOpen: false,
	position: 'bottom',
	openDelay: 300,
	closeDelay: 150,
	isDisabled: false,
	maxHeight: '320px',
	animation: 'scale',
	variant: 'default',
	sizeScale: 100,
	onOpen: fn(),
	onClose: fn(),
	'onUpdate:isOpen': fn(),
} satisfies Meta<typeof BaseHoverCard>['args']
