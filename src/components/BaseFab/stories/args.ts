import { fn } from 'storybook/test'
import type BaseFab from '../ui/BaseFab.vue'
import type { Meta } from '@storybook/vue3-vite'

export const args = {
	label: 'Новая задача',
	icon: 'plus',
	isExtended: false,
	position: 'bottom-right',
	isContained: true,
	isDisabled: false,
	variant: 'default',
	sizeScale: 100,
	onClick: fn(),
} satisfies Meta<typeof BaseFab>['args']
