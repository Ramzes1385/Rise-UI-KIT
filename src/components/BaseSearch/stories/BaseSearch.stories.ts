import { args } from './args'
import * as cases from './cases'
import { render } from './render'
import { argTypes } from './argTypes'
import { parameters } from './parameters'
import type { SearchArgs } from './shared'
import BaseSearch from '../ui/BaseSearch.vue'
import type { Meta } from '@storybook/vue3-vite'

const meta = {
	title: 'Form/BaseSearch',
	component: BaseSearch,
	parameters,
	argTypes,
	args,
	render,
} satisfies Meta<SearchArgs>

export default meta

export const Default = cases.Default
export const Variants = cases.Variants
export const Sizes = cases.Sizes
export const CustomColor = cases.CustomColor
export const Loading = cases.Loading
export const WithError = cases.WithError
export const Disabled = cases.Disabled
export const Empty = cases.Empty
export const LongContent = cases.LongContent
export const WithImages = cases.WithImages
export const Slots = cases.Slots
export const RemoteResults = cases.RemoteResults
export const SearchOnEnter = cases.SearchOnEnter
export const ModalMode = cases.ModalMode
export const SidebarMode = cases.SidebarMode
export const Keyboard = cases.Keyboard
