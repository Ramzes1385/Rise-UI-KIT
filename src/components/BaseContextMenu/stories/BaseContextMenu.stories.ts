import { args } from './args'
import * as cases from './cases'
import { render } from './render'
import { argTypes } from './argTypes'
import { parameters } from './parameters'
import type { Meta } from '@storybook/vue3-vite'
import BaseContextMenu from '../ui/BaseContextMenu.vue'

const meta = {
	title: 'Overlay/BaseContextMenu',
	component: BaseContextMenu,
	parameters,
	argTypes,
	args,
	render,
} satisfies Meta<typeof BaseContextMenu>

export default meta

export const Default = cases.Default
export const CustomColor = cases.CustomColor
export const Disabled = cases.Disabled
export const Keyboard = cases.Keyboard
