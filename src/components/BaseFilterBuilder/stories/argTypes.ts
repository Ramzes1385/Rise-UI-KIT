import type { Meta } from '@storybook/vue3-vite'
import type BaseFilterBuilder from '../ui/BaseFilterBuilder.vue'
import { ARG_GROUP, baseArgTypes, propGroup } from '@/stories/helpers'
import { FILTER_BUILDER_VARIANTS } from '../types/BaseFilterBuilder.types'

export const argTypes = {
	...baseArgTypes({ variants: FILTER_BUILDER_VARIANTS }),
	fields: { control: 'object', table: propGroup(ARG_GROUP.content) },
	modelValue: { control: 'object', table: propGroup(ARG_GROUP.state) },
	isDisabled: { control: 'boolean', table: propGroup(ARG_GROUP.state) },
} satisfies Meta<typeof BaseFilterBuilder>['argTypes']
