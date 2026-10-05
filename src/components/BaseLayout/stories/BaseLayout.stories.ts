import { args } from './args'
import * as cases from './cases'
import { render } from './render'
import { argTypes } from './argTypes'
import { parameters } from './parameters'
import BaseLayout from '../ui/BaseLayout.vue'
import type { Meta } from '@storybook/vue3-vite'

const meta = {
	title: 'Layout/BaseLayout',
	component: BaseLayout,
	parameters,
	argTypes,
	args,
	render,
} satisfies Meta<typeof BaseLayout>

export default meta

export const Default = cases.Default
export const ShortPage = cases.ShortPage
export const Keyboard = cases.Keyboard
export const Theming = cases.Theming
export const Animations = cases.Animations
