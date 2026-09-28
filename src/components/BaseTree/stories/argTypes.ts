import type BaseTree from '../ui/BaseTree.vue'
import type { Meta } from '@storybook/vue3-vite'
import { TREE_VARIANTS } from '../types/BaseTree.types'
import { baseArgTypes, propGroup, ARG_GROUP } from '@/stories/helpers'

export const argTypes = {
	...baseArgTypes({ variants: TREE_VARIANTS }),
	items: { control: 'object', table: propGroup(ARG_GROUP.content) },
	arrowPosition: { control: 'inline-radio', options: ['left', 'right'], table: propGroup(ARG_GROUP.appearance) },
	selectionMode: { control: 'inline-radio', options: ['none', 'single', 'multiple'], table: propGroup(ARG_GROUP.behavior) },
	expandedIds: { control: 'object', table: propGroup(ARG_GROUP.state) },
	selectedIds: { control: 'object', table: propGroup(ARG_GROUP.state) },
	isDefaultExpandAll: { control: 'boolean', table: propGroup(ARG_GROUP.behavior) },
	ariaLabel: { control: 'text', table: propGroup(ARG_GROUP.a11y) },
	isVirtual: { control: 'boolean', table: propGroup(ARG_GROUP.behavior) },
	height: { control: 'number', table: propGroup(ARG_GROUP.appearance) },
	itemSize: { control: 'number', table: propGroup(ARG_GROUP.appearance) },
} satisfies Meta<typeof BaseTree>['argTypes']
