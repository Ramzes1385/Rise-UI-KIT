import { args } from './args'
import * as cases from './cases'
import { render } from './render'
import { argTypes } from './argTypes'
import { parameters } from './parameters'
import type { Meta } from '@storybook/vue3-vite'
import BaseScrollArea from '../ui/BaseScrollArea.vue'

const meta = {
	title: 'Layout/BaseScrollArea',
	component: BaseScrollArea,
	parameters,
	argTypes,
	args,
	render,
} satisfies Meta<typeof BaseScrollArea>

export default meta

export const Default = cases.Default
export const Horizontal = cases.Horizontal
export const Keyboard = cases.Keyboard
