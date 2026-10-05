import { args } from './args'
import * as cases from './cases'
import { render } from './render'
import { argTypes } from './argTypes'
import { parameters } from './parameters'
import type { Meta } from '@storybook/vue3-vite'
import BaseInfiniteScroll from '../ui/BaseInfiniteScroll.vue'

const meta = {
	title: 'Data/BaseInfiniteScroll',
	component: BaseInfiniteScroll,
	parameters,
	argTypes,
	args,
	render,
} satisfies Meta<typeof BaseInfiniteScroll>

export default meta

export const Default = cases.Default
export const Manual = cases.Manual
export const WithError = cases.WithError
export const Keyboard = cases.Keyboard
export const Theming = cases.Theming
export const Animations = cases.Animations
