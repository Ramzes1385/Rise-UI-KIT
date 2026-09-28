import type BaseIcon from '../ui/BaseIcon.vue'
import type { Meta } from '@storybook/vue3-vite'

export const args = {
	name: 'search',
	color: '',
	rotate: 0,
	isFlipX: false,
	isFlipY: false,
	ariaLabel: '',
	sizeScale: 100,
} satisfies Meta<typeof BaseIcon>['args']
