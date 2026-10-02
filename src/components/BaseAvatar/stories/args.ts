import { anna } from './shared'
import type { Meta } from '@storybook/vue3-vite'
import type BaseAvatar from '../ui/BaseAvatar.vue'

export const args = {
	name: anna.name,
	variant: 'default',
	shape: 'circle',
	isOnline: false,
	ring: 'none',
	mascot: 'none',
	isEyesClosed: false,
	isDisabled: false,
	sizeScale: 100,
} satisfies Meta<typeof BaseAvatar>['args']
