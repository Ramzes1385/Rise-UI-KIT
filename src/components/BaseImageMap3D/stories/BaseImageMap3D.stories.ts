import { args } from './args'
import * as cases from './cases'
import { argTypes } from './argTypes'
import { parameters } from './parameters'
import type { Meta } from '@storybook/vue3-vite'
import BaseImageMap3D from '../ui/BaseImageMap3D.vue'

const meta = {
	title: 'Media/BaseImageMap3D',
	component: BaseImageMap3D,
	parameters,
	argTypes,
	args,
} satisfies Meta<typeof BaseImageMap3D>

export default meta

export const Default = cases.Default
export const Fallback2D = cases.Fallback2D
export const RendererFallback = cases.RendererFallback
