import { args } from './args'
import * as cases from './cases'
import { argTypes } from './argTypes'
import { parameters } from './parameters'
import type { Meta } from '@storybook/vue3-vite'
import BaseChecklist from '../ui/BaseChecklist.vue'

const meta = {
	title: 'Data/BaseChecklist',
	component: BaseChecklist,
	parameters,
	argTypes,
	args,
} satisfies Meta<typeof BaseChecklist>

export default meta

export const Default = cases.Default
export const Complete = cases.Complete
export const Disabled = cases.Disabled
export const Variants = cases.Variants
export const Sizes = cases.Sizes
export const CustomColor = cases.CustomColor
