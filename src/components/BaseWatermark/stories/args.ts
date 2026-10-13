import type { Meta } from '@storybook/vue3-vite'
import type BaseWatermark from '../ui/BaseWatermark.vue'

export const args = {
	content: 'Конфиденциально',
	rotate: -22,
	gap: [64, 64],
	opacity: 0.15,
	zIndex: 9,
	fontSize: 16,
	textColor: '#808080',
	isProtected: false,
} satisfies Meta<typeof BaseWatermark>['args']
