import { fn } from 'storybook/test'
import { CARDS, COLUMNS } from './shared'
import { STORY_TODAY } from '@/stories/helpers'
import type { Meta } from '@storybook/vue3-vite'
import type BaseKanban from '../ui/BaseKanban.vue'

export const args = {
	columns: COLUMNS,
	cards: CARDS,
	today: STORY_TODAY,
	isEditable: false,
	isCollapsible: false,
	isDisabled: false,
	variant: 'default',
	sizeScale: 100,
	onMove: fn(),
	onOpen: fn(),
	onCreate: fn(),
	onRename: fn(),
	onDelete: fn(),
} satisfies Meta<typeof BaseKanban>['args']
