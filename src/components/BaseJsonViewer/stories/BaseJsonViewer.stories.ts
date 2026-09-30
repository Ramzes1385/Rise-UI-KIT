import { args } from './args'
import * as cases from './cases'
import { argTypes } from './argTypes'
import { parameters } from './parameters'
import type { Meta } from '@storybook/vue3-vite'
import BaseJsonViewer from '../ui/BaseJsonViewer.vue'

const meta = {
	title: 'Data/BaseJsonViewer',
	component: BaseJsonViewer,
	parameters,
	argTypes,
	args,
} satisfies Meta<typeof BaseJsonViewer>

export default meta

export const Default = cases.Default
export const Variants = cases.Variants
export const Sizes = cases.Sizes
export const CustomColor = cases.CustomColor
export const Toolbar = cases.Toolbar
export const ExpandDepth = cases.ExpandDepth
