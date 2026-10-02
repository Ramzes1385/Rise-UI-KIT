import { args } from './args'
import * as cases from './cases'
import { argTypes } from './argTypes'
import BaseList from '../ui/BaseList.vue'
import { parameters } from './parameters'
import type { ConcreteComponent } from 'vue'
import type { ListStoryArgs } from './shared'
import type { Meta } from '@storybook/vue3-vite'

const meta = {
	title: 'Data/BaseList',
	component: BaseList as unknown as ConcreteComponent<ListStoryArgs>,
	parameters,
	argTypes,
	args,
} satisfies Meta<ListStoryArgs>

export default meta

export const Default = cases.Default
export const Variants = cases.Variants
export const Sizes = cases.Sizes
export const CustomColor = cases.CustomColor
export const Disabled = cases.Disabled
export const WithError = cases.WithError
export const Empty = cases.Empty
export const LongContent = cases.LongContent
export const Avatars = cases.Avatars
export const WithActions = cases.WithActions
export const SingleSelect = cases.SingleSelect
export const MultipleSelect = cases.MultipleSelect
export const Typeahead = cases.Typeahead
export const Sortable = cases.Sortable
export const SortableSelect = cases.SortableSelect
export const CanMove = cases.CanMove
export const Filtered = cases.Filtered
export const Virtual = cases.Virtual
