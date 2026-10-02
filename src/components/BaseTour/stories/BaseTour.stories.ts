import { args } from './args'
import * as cases from './cases'
import { render } from './render'
import { argTypes } from './argTypes'
import BaseTour from '../ui/BaseTour.vue'
import { parameters } from './parameters'
import type { Meta } from '@storybook/vue3-vite'

const meta = {
	title: 'Overlay/BaseTour',
	component: BaseTour,
	parameters,
	argTypes,
	args,
	render,
} satisfies Meta<typeof BaseTour>

export default meta

export const Default = cases.Default
export const Opened = cases.Opened
export const LastStep = cases.LastStep
export const ProgressBar = cases.ProgressBar
export const Minimal = cases.Minimal
export const Placements = cases.Placements
export const ArrowAtEdge = cases.ArrowAtEdge
export const CustomContent = cases.CustomContent
export const NoTarget = cases.NoTarget
export const TargetInteraction = cases.TargetInteraction
export const Keyboard = cases.Keyboard
