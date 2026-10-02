import type { Meta } from '@storybook/vue3-vite'
import { ARG_GROUP, baseArgTypes, propGroup } from '@/stories/helpers'
import { LIST_SELECTION_MODES, LIST_VARIANTS, type BaseListProps } from '../types/BaseList.types'

export const argTypes = {
	...baseArgTypes({ variants: LIST_VARIANTS }),
	selectionMode: { control: 'inline-radio', options: LIST_SELECTION_MODES, table: propGroup(ARG_GROUP.content) },
	isSortable: { control: 'boolean', table: propGroup(ARG_GROUP.content) },
	label: { control: 'text', table: propGroup(ARG_GROUP.content) },
	error: { control: 'text', table: propGroup(ARG_GROUP.state) },
	isDisabled: { control: 'boolean', table: propGroup(ARG_GROUP.state) },
} satisfies Meta<BaseListProps>['argTypes']
