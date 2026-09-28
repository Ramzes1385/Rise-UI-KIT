import { args } from './args'
import * as cases from './cases'
import { render } from './render'
import { argTypes } from './argTypes'
import { parameters } from './parameters'
import type { Meta } from '@storybook/vue3-vite'
import BaseButtonGroup from '../ui/BaseButtonGroup.vue'

const meta = {
	title: 'Element/BaseButtonGroup',
	component: BaseButtonGroup,
	parameters,
	argTypes,
	args,
	render,
} satisfies Meta<typeof BaseButtonGroup>

export default meta

export const Default = cases.Default
export const Variants = cases.Variants
export const Vertical = cases.Vertical
export const WithSplitButton = cases.WithSplitButton
