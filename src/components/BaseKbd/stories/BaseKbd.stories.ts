import { args } from './args'
import * as cases from './cases'
import { render } from './render'
import { argTypes } from './argTypes'
import BaseKbd from '../ui/BaseKbd.vue'
import { parameters } from './parameters'
import type { Meta } from '@storybook/vue3-vite'

const meta = {
	title: 'Element/BaseKbd',
	component: BaseKbd,
	parameters,
	argTypes,
	args,
	render,
} satisfies Meta<typeof BaseKbd>

export default meta

export const Default = cases.Default
export const Variants = cases.Variants
export const Sizes = cases.Sizes
export const SpecialKeys = cases.SpecialKeys
export const Shortcut = cases.Shortcut
export const Theming = cases.Theming
export const Animations = cases.Animations
