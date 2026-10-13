import type { Meta } from '@storybook/vue3-vite'
import type BaseTooltip from '../ui/BaseTooltip.vue'

export const args = {
	text: 'Скопировать ссылку',
	position: 'top',
	variant: 'default',
	isAlwaysVisible: false,
	isWrapperless: false,
	sizeScale: 100,
} satisfies Meta<typeof BaseTooltip>['args']
