import type BaseBadge from '../ui/BaseBadge.vue'
import type { Meta } from '@storybook/vue3-vite'
import { BADGE_STATUSES, BADGE_VARIANTS } from '../types/BaseBadge.types'
import { baseArgTypes, propGroup, ARG_GROUP, slotArgType } from '@/stories/helpers'

export const argTypes = {
	...baseArgTypes({ variants: BADGE_VARIANTS }),
	status: { control: 'select', options: BADGE_STATUSES, table: propGroup(ARG_GROUP.appearance) },
	isDot: { control: 'boolean', table: propGroup(ARG_GROUP.appearance) },
	isRound: { control: 'boolean', table: propGroup(ARG_GROUP.appearance) },
	isRemovable: { control: 'boolean', table: propGroup(ARG_GROUP.behavior) },
	removeLabel: { control: 'text', table: propGroup(ARG_GROUP.content) },
	isRemoveFocusable: { control: 'boolean', table: propGroup(ARG_GROUP.behavior) },
	isDisabled: { control: 'boolean', table: propGroup(ARG_GROUP.state) },
	label: { control: 'text', table: propGroup(ARG_GROUP.content) },
	default: slotArgType('Содержимое (заменяет label)'),
} satisfies Meta<typeof BaseBadge>['argTypes']
