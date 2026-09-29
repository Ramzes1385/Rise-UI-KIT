import { fn } from 'storybook/test'
import { CARDS, COLUMNS } from './shared'
import type { Meta } from '@storybook/vue3-vite'
import type BaseKanban from '../ui/BaseKanban.vue'

export const args = {
	columns: COLUMNS,
	cards: CARDS,
	isDisabled: false,
	variant: 'default',
	sizeScale: 100,
	onMove: fn(),
	onOpen: fn(),
} satisfies Meta<typeof BaseKanban>['args']
