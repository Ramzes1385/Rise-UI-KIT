import { args } from './args'
import * as cases from './cases'
import { render } from './render'
import { argTypes } from './argTypes'
import { parameters } from './parameters'
import type { Meta } from '@storybook/vue3-vite'
import BasePagination from '../ui/BasePagination.vue'

const meta = {
	title: 'Navigation/BasePagination',
	component: BasePagination,
	parameters,
	argTypes,
	args,
	render,
} satisfies Meta<typeof BasePagination>

export default meta

export const Default = cases.Default
export const Variants = cases.Variants
export const Sizes = cases.Sizes
export const CustomColor = cases.CustomColor
export const Empty = cases.Empty
export const OutOfRange = cases.OutOfRange
export const ManyPages = cases.ManyPages
export const WithoutLastPage = cases.WithoutLastPage
export const Keyboard = cases.Keyboard
