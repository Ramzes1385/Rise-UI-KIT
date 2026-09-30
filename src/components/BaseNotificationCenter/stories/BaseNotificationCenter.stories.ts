import { args } from './args'
import * as cases from './cases'
import { argTypes } from './argTypes'
import { parameters } from './parameters'
import type { Meta } from '@storybook/vue3-vite'
import BaseNotificationCenter from '../ui/BaseNotificationCenter.vue'

const meta = {
	title: 'Overlay/BaseNotificationCenter',
	component: BaseNotificationCenter,
	parameters,
	argTypes,
	args,
} satisfies Meta<typeof BaseNotificationCenter>

export default meta

export const Default = cases.Default
export const InPopover = cases.InPopover
export const Empty = cases.Empty
export const Variants = cases.Variants
export const Sizes = cases.Sizes
