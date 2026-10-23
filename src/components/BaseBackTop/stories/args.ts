import { fn } from 'storybook/test'
import type { Meta } from '@storybook/vue3-vite'
import type BaseBackTop from '../ui/BaseBackTop.vue'

export const args = {
	variant: 'default',
	visibilityHeight: 200,
	isExtended: false,
	position: 'bottom-right',
	isContained: true,
	sizeScale: 100,
	onClick: fn(),
} satisfies Meta<typeof BaseBackTop>['args']
