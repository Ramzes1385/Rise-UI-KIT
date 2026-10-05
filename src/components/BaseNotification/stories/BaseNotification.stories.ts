import { args } from './args'
import * as cases from './cases'
import { render } from './render'
import { argTypes } from './argTypes'
import { parameters } from './parameters'
import type { Meta } from '@storybook/vue3-vite'
import BaseNotification from '../ui/BaseNotification.vue'

const meta = {
	title: 'Overlay/BaseNotification',
	component: BaseNotification,
	parameters,
	argTypes,
	args,
	render,
} satisfies Meta<typeof BaseNotification>

export default meta

export const Default = cases.Default
export const Types = cases.Types
export const Variants = cases.Variants
export const CustomColor = cases.CustomColor
export const LongContent = cases.LongContent
export const Positions = cases.Positions
export const ShowFromCode = cases.ShowFromCode
export const AutoClose = cases.AutoClose
export const Actions = cases.Actions
export const Persistent = cases.Persistent
export const PauseOnHover = cases.PauseOnHover
export const Keyboard = cases.Keyboard
export const Theming = cases.Theming
export const Animations = cases.Animations
