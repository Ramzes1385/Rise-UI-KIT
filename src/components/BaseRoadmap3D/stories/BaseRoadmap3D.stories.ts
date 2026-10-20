import { args } from './args'
import * as cases from './cases'
import { argTypes } from './argTypes'
import { parameters } from './parameters'
import type { Meta } from '@storybook/vue3-vite'
import BaseRoadmap3D from '../ui/BaseRoadmap3D.vue'

const meta = {
	title: 'Data/BaseRoadmap3D',
	component: BaseRoadmap3D,
	parameters,
	argTypes,
	args,
} satisfies Meta<typeof BaseRoadmap3D>

export default meta

export const Default = cases.Default
export const Disabled = cases.Disabled
export const Loading = cases.Loading
export const Empty = cases.Empty
export const WithError = cases.WithError
export const Animations = cases.Animations
export const LongContent = cases.LongContent
export const Keyboard = cases.Keyboard
