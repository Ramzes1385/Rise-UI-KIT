import { args } from './args'
import * as cases from './cases'
import { argTypes } from './argTypes'
import BaseMap from '../ui/BaseMap.vue'
import { parameters } from './parameters'
import type { Meta } from '@storybook/vue3-vite'

const meta = {
	title: 'Media/BaseMap',
	component: BaseMap,
	parameters,
	argTypes,
	args,
} satisfies Meta<typeof BaseMap>

export default meta

export const Default = cases.Default
export const Markers = cases.Markers
export const Navigation = cases.Navigation
export const ClickToAdd = cases.ClickToAdd
export const Providers = cases.Providers
export const Variants = cases.Variants
export const Sizes = cases.Sizes
export const Heights = cases.Heights
export const Theming = cases.Theming
export const Loading = cases.Loading
export const Seo = cases.Seo
export const Placeholder = cases.Placeholder
export const Languages = cases.Languages
export const OfficeList = cases.OfficeList
