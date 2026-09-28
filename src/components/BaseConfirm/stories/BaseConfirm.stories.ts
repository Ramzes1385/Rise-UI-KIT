import { args } from './args'
import * as cases from './cases'
import { render } from './render'
import { argTypes } from './argTypes'
import { parameters } from './parameters'
import BaseConfirm from '../ui/BaseConfirm.vue'
import type { Meta } from '@storybook/vue3-vite'

const meta = {
	title: 'Overlay/BaseConfirm',
	component: BaseConfirm,
	parameters,
	argTypes,
	args,
	render,
} satisfies Meta<typeof BaseConfirm>

export default meta

export const Default = cases.Default
export const Opened = cases.Opened
export const Danger = cases.Danger
export const LongContent = cases.LongContent
export const FromCode = cases.FromCode
export const Keyboard = cases.Keyboard
