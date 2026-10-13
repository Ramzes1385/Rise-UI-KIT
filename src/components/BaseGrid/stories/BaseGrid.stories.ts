import { args } from './args'
import * as cases from './cases'
import { render } from './render'
import { argTypes } from './argTypes'
import BaseGrid from '../ui/BaseGrid.vue'
import { parameters } from './parameters'
import type { Meta } from '@storybook/vue3-vite'

const meta = {
	title: 'Layout/BaseGrid',
	component: BaseGrid,
	parameters,
	argTypes,
	args,
	render,
} satisfies Meta<typeof BaseGrid>

export default meta

export const Default = cases.Default
export const Basic = cases.Basic
export const Responsive = cases.Responsive
export const Spans = cases.Spans
export const Gaps = cases.Gaps
export const Theming = cases.Theming
export const Animations = cases.Animations
