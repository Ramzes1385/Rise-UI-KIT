import { args } from './args'
import * as cases from './cases'
import { argTypes } from './argTypes'
import BaseIcon from '../ui/BaseIcon.vue'
import { parameters } from './parameters'
import type { Meta } from '@storybook/vue3-vite'

const meta = {
	title: 'Element/BaseIcon',
	component: BaseIcon,
	parameters,
	argTypes,
	args,
} satisfies Meta<typeof BaseIcon>

export default meta

export const Default = cases.Default
export const Gallery = cases.Gallery
export const Sizes = cases.Sizes
export const CustomColor = cases.CustomColor
export const Transform = cases.Transform
export const AriaLabel = cases.AriaLabel
