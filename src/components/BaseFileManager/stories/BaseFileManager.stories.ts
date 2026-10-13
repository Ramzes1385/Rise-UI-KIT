import { args } from './args'
import * as cases from './cases'
import { argTypes } from './argTypes'
import { parameters } from './parameters'
import type { Meta } from '@storybook/vue3-vite'
import BaseFileManager from '../ui/BaseFileManager.vue'

const meta = {
	title: 'Data/BaseFileManager',
	component: BaseFileManager,
	parameters,
	argTypes,
	args,
} satisfies Meta<typeof BaseFileManager>

export default meta

export const Default = cases.Default
export const GridView = cases.GridView
export const Variants = cases.Variants
export const Sizes = cases.Sizes
export const CustomColor = cases.CustomColor
export const Theming = cases.Theming
export const Disabled = cases.Disabled
export const Readonly = cases.Readonly
export const Loading = cases.Loading
export const WithError = cases.WithError
export const Empty = cases.Empty
export const LongContent = cases.LongContent
export const Selection = cases.Selection
export const Operations = cases.Operations
export const Search = cases.Search
export const Keyboard = cases.Keyboard
export const Animations = cases.Animations
