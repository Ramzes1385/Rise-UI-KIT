import type { Meta } from '@storybook/vue3-vite'
import { ARG_GROUP, baseArgTypes, propGroup } from '@/stories/helpers'
import { TRANSFER_VARIANTS, type BaseTransferProps } from '../types/BaseTransfer.types'

export const argTypes = {
	...baseArgTypes({ variants: TRANSFER_VARIANTS }),
	titles: { control: 'object', table: propGroup(ARG_GROUP.content) },
	label: { control: 'text', table: propGroup(ARG_GROUP.content) },
	isSearchable: { control: 'boolean', table: propGroup(ARG_GROUP.behavior) },
	isSortable: { control: 'boolean', table: propGroup(ARG_GROUP.behavior) },
	height: { control: 'number', table: propGroup(ARG_GROUP.appearance) },
	error: { control: 'text', table: propGroup(ARG_GROUP.state) },
	isDisabled: { control: 'boolean', table: propGroup(ARG_GROUP.state) },
} satisfies Meta<BaseTransferProps>['argTypes']
