import { args } from './args'
import * as cases from './cases'
import { argTypes } from './argTypes'
import BaseCode from '../ui/BaseCode.vue'
import { parameters } from './parameters'
import type { Meta } from '@storybook/vue3-vite'

const meta = {
	title: 'Data/BaseCode',
	component: BaseCode,
	parameters,
	argTypes,
	args,
} satisfies Meta<typeof BaseCode>

export default meta

export const Default = cases.Default
export const Variants = cases.Variants
export const Sizes = cases.Sizes
export const CustomColor = cases.CustomColor
export const Languages = cases.Languages
export const FileExcerpt = cases.FileExcerpt
export const Empty = cases.Empty
export const LongContent = cases.LongContent
export const Wrapped = cases.Wrapped
export const MaxHeight = cases.MaxHeight
export const Copy = cases.Copy
