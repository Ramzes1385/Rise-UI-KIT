import type BaseTag from '../ui/BaseTag.vue'
import type { Meta } from '@storybook/vue3-vite'

export const args = {
	label: 'Vue',
	variant: 'default',
	tone: 'neutral',
	isSelectable: true,
	isSelected: false,
	isRemovable: false,
	isDisabled: false,
	sizeScale: 100,
} satisfies Meta<typeof BaseTag>['args']
