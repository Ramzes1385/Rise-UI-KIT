import { args } from './args'
import * as cases from './cases'
import { argTypes } from './argTypes'
import { parameters } from './parameters'
import type { Meta } from '@storybook/vue3-vite'
import BaseAvatarCropper from '../ui/BaseAvatarCropper.vue'

const meta = {
	title: 'Form/BaseAvatarCropper',
	component: BaseAvatarCropper,
	parameters,
	argTypes,
	args,
} satisfies Meta<typeof BaseAvatarCropper>

export default meta

export const Default = cases.Default
export const Circle = cases.Circle
export const Result = cases.Result
export const Variants = cases.Variants
export const Sizes = cases.Sizes
export const Disabled = cases.Disabled
export const LoadError = cases.LoadError
export const Theming = cases.Theming
export const Animations = cases.Animations
