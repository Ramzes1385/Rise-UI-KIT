import { args } from './args'
import * as cases from './cases'
import { argTypes } from './argTypes'
import { parameters } from './parameters'
import type { Meta } from '@storybook/vue3-vite'
import BaseImageMap from '../ui/BaseImageMap.vue'

const meta = {
	title: 'Media/BaseImageMap',
	component: BaseImageMap,
	parameters,
	argTypes,
	args,
} satisfies Meta<typeof BaseImageMap>

export default meta

export const Default = cases.Default
export const Variants = cases.Variants
export const Sizes = cases.Sizes
export const CustomColor = cases.CustomColor
export const Disabled = cases.Disabled
export const Loading = cases.Loading
export const WithError = cases.WithError
export const Empty = cases.Empty
export const Areas = cases.Areas
export const Slots = cases.Slots
export const LongContent = cases.LongContent
export const Hotspots = cases.Hotspots
export const Floors = cases.Floors
export const Zoom = cases.Zoom
export const InitArea = cases.InitArea
export const MobileSheet = cases.MobileSheet
export const Directory = cases.Directory
export const DirectoryGrid = cases.DirectoryGrid
export const DirectoryNarrow = cases.DirectoryNarrow
export const DirectoryEmpty = cases.DirectoryEmpty
export const Filters = cases.Filters
export const Legend = cases.Legend
export const DeepLink = cases.DeepLink
export const OpeningHours = cases.OpeningHours
export const Routes = cases.Routes
