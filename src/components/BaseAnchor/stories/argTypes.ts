import type { Meta } from '@storybook/vue3-vite'
import type BaseAnchor from '../ui/BaseAnchor.vue'
import { ANCHOR_DIRECTIONS, ANCHOR_VARIANTS } from '../types/BaseAnchor.types'
import { ARG_GROUP, baseArgTypes, propGroup, slotArgType } from '@/stories/helpers'

export const argTypes = {
	...baseArgTypes({ variants: ANCHOR_VARIANTS }),
	items: { control: 'object', table: propGroup(ARG_GROUP.content) },
	headings: { control: 'text', table: propGroup(ARG_GROUP.content) },
	content: { control: false, table: propGroup(ARG_GROUP.content) },
	label: { control: 'text', table: propGroup(ARG_GROUP.a11y) },
	direction: { control: 'inline-radio', options: ANCHOR_DIRECTIONS, table: propGroup(ARG_GROUP.appearance) },
	active: { control: 'text', table: propGroup(ARG_GROUP.state) },
	target: { control: false, table: propGroup(ARG_GROUP.behavior) },
	offset: { control: 'number', table: propGroup(ARG_GROUP.behavior) },
	isHashSynced: { control: 'boolean', table: propGroup(ARG_GROUP.behavior) },
	item: slotArgType('Содержимое ссылки пункта: `{ item, isActive }`'),
} satisfies Meta<typeof BaseAnchor>['argTypes']
