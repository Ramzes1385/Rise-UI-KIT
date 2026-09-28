import { PLACEMENTS } from './shared'
import type BaseChip from '../ui/BaseChip.vue'
import type { Meta } from '@storybook/vue3-vite'
import { CHIP_VARIANTS } from '../types/BaseChip.types'
import { baseArgTypes, propGroup, ARG_GROUP } from '@/stories/helpers'

export const argTypes = {
	...baseArgTypes({ variants: CHIP_VARIANTS }),
	content: { control: 'text', table: propGroup(ARG_GROUP.content) },
	placement: { control: 'inline-radio', options: PLACEMENTS, table: propGroup(ARG_GROUP.appearance) },
	hasOverflow: { control: 'boolean', table: propGroup(ARG_GROUP.behavior) },
	maxValue: { control: 'number', table: propGroup(ARG_GROUP.behavior) },
	isHiddenOnZero: { control: 'boolean', table: propGroup(ARG_GROUP.behavior) },
	default: { control: false },
} satisfies Meta<typeof BaseChip>['argTypes']
