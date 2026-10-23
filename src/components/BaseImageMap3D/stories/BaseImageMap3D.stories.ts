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
export const Floors3D = cases.Floors3D
export const Glb = cases.Glb
export const Detailed3D = cases.Detailed3D
export const CameraKeyboard = cases.CameraKeyboard
export const Keyboard = cases.Keyboard
export const Directory3D = cases.Directory3D
export const Routes3D = cases.Routes3D
export const Animations = cases.Animations
export const Legend3D = cases.Legend3D
export const Fullscreen3D = cases.Fullscreen3D
export const PulsingMarkers = cases.PulsingMarkers
export const ObjectsAllFloors = cases.ObjectsAllFloors
export const GlbOutline = cases.GlbOutline
export const Theming = cases.Theming
