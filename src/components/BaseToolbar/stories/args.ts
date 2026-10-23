import type { Meta } from '@storybook/vue3-vite'
import type BaseToolbar from '../ui/BaseToolbar.vue'

export const args = {
	ariaLabel: 'Форматирование',
	orientation: 'horizontal',
	variant: 'outline',
	sizeScale: 100,
} satisfies Meta<typeof BaseToolbar>['args']
