import type { Meta } from '@storybook/vue3-vite'
import type BaseSkeleton from '../ui/BaseSkeleton.vue'

export const args = {
	shape: 'text',
	width: '60%',
	isAnimated: true,
	isPulse: false,
	sizeScale: 100,
} satisfies Meta<typeof BaseSkeleton>['args']
