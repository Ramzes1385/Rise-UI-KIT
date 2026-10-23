import type { Meta } from '@storybook/vue3-vite'
import type BaseTextDiff from '../ui/BaseTextDiff.vue'
import { ARG_GROUP, baseArgTypes, propGroup } from '@/stories/helpers'
import { TEXT_DIFF_MODES, TEXT_DIFF_VARIANTS } from '../types/BaseTextDiff.types'

export const argTypes = {
	...baseArgTypes({ variants: TEXT_DIFF_VARIANTS }),
	before: { control: 'text', table: propGroup(ARG_GROUP.content) },
	after: { control: 'text', table: propGroup(ARG_GROUP.content) },
	label: { control: 'text', table: propGroup(ARG_GROUP.a11y) },
	mode: { control: 'inline-radio', options: TEXT_DIFF_MODES, table: propGroup(ARG_GROUP.appearance) },
	beforeLabel: { control: 'text', table: propGroup(ARG_GROUP.content) },
	afterLabel: { control: 'text', table: propGroup(ARG_GROUP.content) },
	isWordDiff: { control: 'boolean', table: propGroup(ARG_GROUP.behavior) },
} satisfies Meta<typeof BaseTextDiff>['argTypes']
