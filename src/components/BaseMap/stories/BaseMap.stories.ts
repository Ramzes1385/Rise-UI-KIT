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
export const Animations = cases.Animations
export const Loading = cases.Loading
export const Seo = cases.Seo
export const Placeholder = cases.Placeholder
export const Language = cases.Language
export const OfficeList = cases.OfficeList
export const Scheme = cases.Scheme
export const SchemeSwitch = cases.SchemeSwitch
export const MarkerIcons = cases.MarkerIcons
export const Balloon = cases.Balloon
export const Shapes = cases.Shapes
export const Controls = cases.Controls
export const FitMarkers = cases.FitMarkers
export const Clusters = cases.Clusters
export const Layers = cases.Layers
export const Gestures = cases.Gestures
export const StaticPreview = cases.StaticPreview
