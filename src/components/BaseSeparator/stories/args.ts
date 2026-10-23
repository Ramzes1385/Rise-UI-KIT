import type { Meta } from '@storybook/vue3-vite'
import type BaseSeparator from '../ui/BaseSeparator.vue'

export const args = {
	orientation: 'horizontal',
	isDashed: false,
	thickness: 1,
	sizeScale: 100,
} satisfies Meta<typeof BaseSeparator>['args']
