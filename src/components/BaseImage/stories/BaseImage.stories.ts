import { args } from './args'
import * as cases from './cases'
import { argTypes } from './argTypes'
import { parameters } from './parameters'
import BaseImage from '../ui/BaseImage.vue'
import type { Meta } from '@storybook/vue3-vite'

const meta = {
	title: 'Element/BaseImage',
	component: BaseImage,
	parameters,
	argTypes,
	args,
} satisfies Meta<typeof BaseImage>

export default meta

export const Default = cases.Default
export const Fits = cases.Fits
export const BorderRadius = cases.BorderRadius
export const CustomColor = cases.CustomColor
export const WithError = cases.WithError
export const Fallback = cases.Fallback
export const WithZoom = cases.WithZoom
export const Gallery = cases.Gallery
export const Keyboard = cases.Keyboard
export const Rotation = cases.Rotation
export const Seo = cases.Seo
