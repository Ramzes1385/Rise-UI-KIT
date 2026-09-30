import { ITEMS } from './shared'
import { fn } from 'storybook/test'
import type { Meta } from '@storybook/vue3-vite'
import type BaseMegaMenu from '../ui/BaseMegaMenu.vue'

export const args = {
	items: ITEMS,
	openKey: 'products',
	trigger: 'hover',
	openDelay: 150,
	closeDelay: 300,
	variant: 'default',
	sizeScale: 100,
	'onUpdate:openKey': fn(),
	onSelect: fn(),
} satisfies Meta<typeof BaseMegaMenu>['args']
