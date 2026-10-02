import type BaseTag from '../ui/BaseTag.vue'
import type { Meta } from '@storybook/vue3-vite'
import { TAG_TONES, TAG_VARIANTS } from '../types/BaseTag.types'
import { ARG_GROUP, baseArgTypes, propGroup, slotArgType } from '@/stories/helpers'

export const argTypes = {
	...baseArgTypes({ variants: TAG_VARIANTS }),
	label: { control: 'text', table: propGroup(ARG_GROUP.content) },
	icon: { control: 'text', table: propGroup(ARG_GROUP.content) },
	removeLabel: { control: 'text', table: propGroup(ARG_GROUP.content) },
	tone: { control: 'select', options: TAG_TONES, table: propGroup(ARG_GROUP.appearance) },
	isSelectable: { control: 'boolean', table: propGroup(ARG_GROUP.behavior) },
	isSelected: { control: 'boolean', table: propGroup(ARG_GROUP.state) },
	isRemovable: { control: 'boolean', table: propGroup(ARG_GROUP.behavior) },
	isDisabled: { control: 'boolean', table: propGroup(ARG_GROUP.state) },
	default: slotArgType('Содержимое (заменяет label)'),
} satisfies Meta<typeof BaseTag>['argTypes']
