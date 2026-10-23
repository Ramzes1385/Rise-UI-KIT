import { args } from './args'
import * as cases from './cases'
import { render } from './render'
import { argTypes } from './argTypes'
import { parameters } from './parameters'
import BaseRoadmap from '../ui/BaseRoadmap.vue'
import type { Meta } from '@storybook/vue3-vite'

const meta = {
	title: 'Data/BaseRoadmap',
	component: BaseRoadmap,
	parameters,
	argTypes,
	args,
	render,
} satisfies Meta<typeof BaseRoadmap>

export default meta

export const Default = cases.Default
export const Layouts = cases.Layouts
export const Narrow = cases.Narrow
export const Progress = cases.Progress
export const Hooks = cases.Hooks
export const Alternatives = cases.Alternatives
export const Locked = cases.Locked
export const Materials = cases.Materials
export const Variants = cases.Variants
export const Sizes = cases.Sizes
export const CustomColor = cases.CustomColor
export const Disabled = cases.Disabled
export const Loading = cases.Loading
export const Empty = cases.Empty
export const WithError = cases.WithError
export const LongContent = cases.LongContent
export const Keyboard = cases.Keyboard
export const Rtl = cases.Rtl
export const LayoutSnake = cases.LayoutSnake
export const LayoutList = cases.LayoutList
export const LayoutHorizontal = cases.LayoutHorizontal
export const Animations = cases.Animations
export const Edit = cases.Edit
export const Reorder = cases.Reorder
export const Templates = cases.Templates
export const EditHooks = cases.EditHooks
export const EditHooksEmpty = cases.EditHooksEmpty
export const EditHooksDenied = cases.EditHooksDenied
export const DefaultStatus = cases.DefaultStatus
export const Review = cases.Review
export const ReviewNarrow = cases.ReviewNarrow
export const ReviewStale = cases.ReviewStale
export const ReviewRejected = cases.ReviewRejected
