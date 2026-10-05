import { args } from './args'
import * as cases from './cases'
import { argTypes } from './argTypes'
import { parameters } from './parameters'
import BaseTable from '../ui/BaseTable.vue'
import type { Meta } from '@storybook/vue3-vite'

const meta = {
	title: 'Data/BaseTable',
	component: BaseTable,
	parameters,
	argTypes,
	args,
} satisfies Meta<typeof BaseTable>

export default meta

export const Default = cases.Default
export const Variants = cases.Variants
export const Sizes = cases.Sizes
export const CustomColor = cases.CustomColor
export const Padding = cases.Padding
export const Empty = cases.Empty
export const Loading = cases.Loading
export const LongContent = cases.LongContent
export const Sorting = cases.Sorting
export const Selection = cases.Selection
export const Export = cases.Export
export const Toolbar = cases.Toolbar
export const Pagination = cases.Pagination
export const LoadMore = cases.LoadMore
export const ExpandableRows = cases.ExpandableRows
export const NestedTable = cases.NestedTable
export const StickyHeader = cases.StickyHeader
export const Virtual = cases.Virtual
export const ResizableColumns = cases.ResizableColumns
export const CustomCells = cases.CustomCells
export const SlotsByKey = cases.SlotsByKey
export const Keyboard = cases.Keyboard
