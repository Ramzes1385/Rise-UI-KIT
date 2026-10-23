import { args } from './args'
import * as cases from './cases'
import { argTypes } from './argTypes'
import { decorators } from './decorators'
import { parameters } from './parameters'
import type { Meta } from '@storybook/vue3-vite'
import BaseFileUpload from '../ui/BaseFileUpload.vue'

const meta = {
	title: 'Form/BaseFileUpload',
	component: BaseFileUpload,
	parameters,
	decorators,
	argTypes,
	args,
} satisfies Meta<typeof BaseFileUpload>

export default meta

export const Default = cases.Default
export const Variants = cases.Variants
export const Sizes = cases.Sizes
export const CustomColor = cases.CustomColor
export const Theming = cases.Theming
export const Empty = cases.Empty
export const WithError = cases.WithError
export const Disabled = cases.Disabled
export const Loading = cases.Loading
export const LongContent = cases.LongContent
export const Multiple = cases.Multiple
export const ImagesOnly = cases.ImagesOnly
export const DragAndDrop = cases.DragAndDrop
export const Keyboard = cases.Keyboard
export const UploadError = cases.UploadError
export const Animations = cases.Animations
