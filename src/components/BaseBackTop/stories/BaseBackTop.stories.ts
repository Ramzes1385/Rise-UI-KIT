import { args } from './args'
import * as cases from './cases'
import { render } from './render'
import { argTypes } from './argTypes'
import { parameters } from './parameters'
import BaseBackTop from '../ui/BaseBackTop.vue'
import type { Meta } from '@storybook/vue3-vite'

const meta = {
	title: 'Navigation/BaseBackTop',
	component: BaseBackTop,
	parameters,
	argTypes,
	args,
	render,
} satisfies Meta<typeof BaseBackTop>

export default meta

export const Default = cases.Default
export const Extended = cases.Extended
export const Keyboard = cases.Keyboard
