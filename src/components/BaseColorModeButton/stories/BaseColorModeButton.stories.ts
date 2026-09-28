import { args } from './args'
import * as cases from './cases'
import { render } from './render'
import { argTypes } from './argTypes'
import { parameters } from './parameters'
import type { Meta } from '@storybook/vue3-vite'
import BaseColorModeButton from '../ui/BaseColorModeButton.vue'

const meta = {
	title: 'Element/BaseColorModeButton',
	component: BaseColorModeButton,
	parameters,
	argTypes,
	args,
	render,
} satisfies Meta<typeof BaseColorModeButton>

export default meta

export const Default = cases.Default
export const Variants = cases.Variants
export const Sizes = cases.Sizes
export const CustomColor = cases.CustomColor
export const Disabled = cases.Disabled
