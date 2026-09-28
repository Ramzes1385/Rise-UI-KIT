import type { Meta } from '@storybook/vue3-vite'
import type BaseHeader from '../ui/BaseHeader.vue'

export const args = {
	title: 'Rise CRM',
	href: '#home',
	variant: 'default',
	containerSize: 'full',
	isSticky: true,
	menuDirection: 'right',
	sizeScale: 100,
} satisfies Meta<typeof BaseHeader>['args']
