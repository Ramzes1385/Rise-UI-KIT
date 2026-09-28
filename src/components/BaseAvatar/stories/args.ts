import { anna } from './shared'
import { fn } from 'storybook/test'
import type { Meta } from '@storybook/vue3-vite'
import type BaseAvatar from '../ui/BaseAvatar.vue'

export const args = {
	name: anna.name,
	variant: 'default',
	shape: 'circle',
	isOnline: false,
	sizeScale: 100,
	onClick: fn(),
} satisfies Meta<typeof BaseAvatar>['args']
