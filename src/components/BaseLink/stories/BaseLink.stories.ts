import { args } from './args'
import * as cases from './cases'
import { argTypes } from './argTypes'
import BaseLink from '../ui/BaseLink.vue'
import { parameters } from './parameters'
import type { Meta } from '@storybook/vue3-vite'

const meta = {
	title: 'Navigation/BaseLink',
	component: BaseLink,
	parameters,
	argTypes,
	args,
} satisfies Meta<typeof BaseLink>

export default meta

export const Default = cases.Default
export const Variants = cases.Variants
export const Sizes = cases.Sizes
export const CustomColor = cases.CustomColor
export const Disabled = cases.Disabled
export const LongContent = cases.LongContent
export const External = cases.External
export const UnsafeUrl = cases.UnsafeUrl
