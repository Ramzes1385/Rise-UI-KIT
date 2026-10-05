import { args } from './args'
import * as cases from './cases'
import { argTypes } from './argTypes'
import { parameters } from './parameters'
import type { Meta } from '@storybook/vue3-vite'
import BaseCountdown from '../ui/BaseCountdown.vue'

const meta = {
	title: 'Data/BaseCountdown',
	component: BaseCountdown,
	parameters,
	argTypes,
	args,
} satisfies Meta<typeof BaseCountdown>

export default meta

export const Default = cases.Default
export const Layouts = cases.Layouts
export const Finish = cases.Finish
export const Finished = cases.Finished
export const Variants = cases.Variants
export const Sizes = cases.Sizes
export const CustomColor = cases.CustomColor
export const DigitAnimations = cases.DigitAnimations
export const Animations = cases.Animations
