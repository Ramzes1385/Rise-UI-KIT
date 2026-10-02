import type { Meta } from '@storybook/vue3-vite'
import type BaseMarquee from '../ui/BaseMarquee.vue'

export const args = {
	label: 'Пример',
	variant: 'default',
	sizeScale: 100,
} satisfies Meta<typeof BaseMarquee>['args']
