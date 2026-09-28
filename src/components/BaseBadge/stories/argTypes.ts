import type BaseBadge from '../ui/BaseBadge.vue'
import type { Meta } from '@storybook/vue3-vite'
import { BADGE_VARIANTS } from '../types/BaseBadge.types'
import { baseArgTypes, propGroup, ARG_GROUP, slotArgType } from '@/stories/helpers'

export const argTypes = {
	...baseArgTypes({ variants: BADGE_VARIANTS }),
	label: { control: 'text', table: propGroup(ARG_GROUP.content) },
	default: slotArgType('Содержимое (заменяет label)'),
} satisfies Meta<typeof BaseBadge>['argTypes']
