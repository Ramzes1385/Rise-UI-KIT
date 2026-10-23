import { args } from './args'
import * as cases from './cases'
import { render } from './render'
import { argTypes } from './argTypes'
import { parameters } from './parameters'
import type { Meta } from '@storybook/vue3-vite'
import BaseRoadmap3D from '../ui/BaseRoadmap3D.vue'

const meta = {
	title: 'Data/BaseRoadmap3D',
	component: BaseRoadmap3D,
	parameters,
	argTypes,
	args,
	render,
} satisfies Meta<typeof BaseRoadmap3D>

export default meta

export const Default = cases.Default
export const FocusStage = cases.FocusStage
export const Tour = cases.Tour
export const Edit = cases.Edit
export const Locked = cases.Locked
export const CustomPedestals = cases.CustomPedestals
export const Hooks = cases.Hooks
export const Quality = cases.Quality
export const Narrow = cases.Narrow
export const Rtl = cases.Rtl
export const Fallback2D = cases.Fallback2D
export const Disabled = cases.Disabled
export const Loading = cases.Loading
export const Empty = cases.Empty
export const WithError = cases.WithError
export const Animations = cases.Animations
export const LongContent = cases.LongContent
export const Medium = cases.Medium
export const Keyboard = cases.Keyboard
