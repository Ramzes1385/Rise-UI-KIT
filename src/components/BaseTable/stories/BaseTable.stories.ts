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
export const Theming = cases.Theming
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
export const Animations = cases.Animations
export const FilterOperators = cases.FilterOperators
export const ToolbarKeyboard = cases.ToolbarKeyboard
export const ColumnsPanel = cases.ColumnsPanel
export const InfiniteWithoutHeight = cases.InfiniteWithoutHeight
export const ExpandedIds = cases.ExpandedIds
export const SortLocale = cases.SortLocale
export const ColumnResizeTouch = cases.ColumnResizeTouch
export const ControlledPagination = cases.ControlledPagination
export const ServerTotalRows = cases.ServerTotalRows
export const ControlledSelection = cases.ControlledSelection
export const StickyColumnsResize = cases.StickyColumnsResize
export const SortCompare = cases.SortCompare
export const DateFilterTimezone = cases.DateFilterTimezone
export const ChipKeyboardRemove = cases.ChipKeyboardRemove
