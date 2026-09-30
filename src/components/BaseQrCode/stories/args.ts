import type { Meta } from '@storybook/vue3-vite'
import type BaseQrCode from '../ui/BaseQrCode.vue'

export const args = {
	value: 'https://ramzes1385.github.io/Rise-UI-KIT/',
	size: 160,
	margin: 4,
	variant: 'default',
	sizeScale: 100,
} satisfies Meta<typeof BaseQrCode>['args']
