import type { Meta } from '@storybook/vue3-vite'
import type BaseButtonGroup from '../ui/BaseButtonGroup.vue'

export const args = {
	orientation: 'horizontal',
	ariaLabel: 'Период',
	variant: 'default',
	sizeScale: 100,
} satisfies Meta<typeof BaseButtonGroup>['args']
