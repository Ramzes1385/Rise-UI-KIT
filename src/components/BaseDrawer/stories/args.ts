import { fn } from 'storybook/test'
import type { Meta } from '@storybook/vue3-vite'
import type BaseDrawer from '../ui/BaseDrawer.vue'

export const args = {
	isOpen: false,
	title: 'Фильтры',
	description: 'Заказы за сентябрь',
	direction: 'bottom',
	hasHandle: true,
	hasOverlay: true,
	isDraggable: true,
	closeOnOverlay: true,
	closeOnEscape: true,
	sizeScale: 100,
	onClose: fn(),
} satisfies Meta<typeof BaseDrawer>['args']
