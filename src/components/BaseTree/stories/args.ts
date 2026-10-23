import { FILES } from './shared'
import { fn } from 'storybook/test'
import type BaseTree from '../ui/BaseTree.vue'
import type { Meta } from '@storybook/vue3-vite'

export const args = {
	items: FILES,
	ariaLabel: 'Файлы проекта',
	variant: 'default',
	sizeScale: 100,
	selectionMode: 'none',
	arrowPosition: 'left',
	isDefaultExpandAll: false,
	expandedIds: ['src'],
	selectedIds: [],
	onToggle: fn(),
	onSelect: fn(),
	'onUpdate:expandedIds': fn(),
	'onUpdate:selectedIds': fn(),
} satisfies Meta<typeof BaseTree>['args']
