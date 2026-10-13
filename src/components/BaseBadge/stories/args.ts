import type BaseBadge from '../ui/BaseBadge.vue'
import type { Meta } from '@storybook/vue3-vite'

export const args = {
	label: 'Новый',
	variant: 'default',
	status: 'primary',
	isDot: false,
	isRound: false,
	isRemovable: false,
	isRemoveFocusable: true,
	isDisabled: false,
	sizeScale: 100,
} satisfies Meta<typeof BaseBadge>['args']
