import { args } from './args'
import * as cases from './cases'
import { render } from './render'
import { argTypes } from './argTypes'
import { parameters } from './parameters'
import BaseAffix from '../ui/BaseAffix.vue'
import type { Meta } from '@storybook/vue3-vite'

const meta = {
	title: 'Layout/BaseAffix',
	component: BaseAffix,
	parameters,
	argTypes,
	args,
	render,
} satisfies Meta<typeof BaseAffix>

export default meta

export const Default = cases.Default
export const Top = cases.Top
export const Bottom = cases.Bottom
export const InContainer = cases.InContainer
export const WithShadow = cases.WithShadow
export const Theming = cases.Theming
export const Animations = cases.Animations
