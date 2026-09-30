import type { Meta } from '@storybook/vue3-vite'
import type BasePagination from '../ui/BasePagination.vue'
import { PAGINATION_VARIANTS } from '../types/BasePagination.types'
import { baseArgTypes, propGroup, ARG_GROUP, hiddenArgTypes } from '@/stories/helpers'

export const argTypes = {
	...baseArgTypes({ variants: PAGINATION_VARIANTS }),
	modelValue: { control: { type: 'number', min: 1 }, table: propGroup(ARG_GROUP.content) },
	total: { control: { type: 'number', min: 0 }, table: propGroup(ARG_GROUP.content) },
	pageSize: { control: { type: 'number', min: 1 }, table: propGroup(ARG_GROUP.content) },
	maxVisible: { control: { type: 'number', min: 3, max: 15 }, table: propGroup(ARG_GROUP.behavior) },
	showLastPage: { control: 'boolean', table: propGroup(ARG_GROUP.behavior) },
	...hiddenArgTypes('default'),
} satisfies Meta<typeof BasePagination>['argTypes']
