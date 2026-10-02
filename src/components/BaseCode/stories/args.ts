import type BaseCode from '../ui/BaseCode.vue'
import type { Meta } from '@storybook/vue3-vite'

export const args = {
	label: 'Пример',
	variant: 'default',
	sizeScale: 100,
} satisfies Meta<typeof BaseCode>['args']
