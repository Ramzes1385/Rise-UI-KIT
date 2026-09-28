import { args } from './args'
import * as cases from './cases'
import { argTypes } from './argTypes'
import { parameters } from './parameters'
import type { Meta } from '@storybook/vue3-vite'
import BaseAnimation from '../ui/BaseAnimation.vue'

const meta = {
	title: 'Element/BaseAnimation',
	component: BaseAnimation,
	parameters,
	argTypes,
	args,
} satisfies Meta<typeof BaseAnimation>

export default meta

export const Default = cases.Default
export const Names = cases.Names
export const List = cases.List
export const Collapse = cases.Collapse
