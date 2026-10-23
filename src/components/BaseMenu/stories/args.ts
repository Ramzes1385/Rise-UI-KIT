import { ITEMS } from './shared'
import { fn } from 'storybook/test'
import type BaseMenu from '../ui/BaseMenu.vue'
import type { Meta } from '@storybook/vue3-vite'

export const args = {
	items: ITEMS,
	variant: 'default',
	sizeScale: 100,
	onSelect: fn(),
} satisfies Meta<typeof BaseMenu>['args']
