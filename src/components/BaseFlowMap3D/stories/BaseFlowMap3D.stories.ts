import { args } from './args'
import * as cases from './cases'
import { argTypes } from './argTypes'
import { parameters } from './parameters'
import type { Meta } from '@storybook/vue3-vite'
import BaseFlowMap3D from '../ui/BaseFlowMap3D.vue'

const meta = {
	title: 'Data/BaseFlowMap3D',
	component: BaseFlowMap3D,
	parameters,
	argTypes,
	args,
} satisfies Meta<typeof BaseFlowMap3D>

export default meta

export const Default = cases.Default
export const CameraPresets = cases.CameraPresets
export const Notations = cases.Notations
export const Hooks = cases.Hooks
export const Keyboard = cases.Keyboard
export const Fallback2D = cases.Fallback2D
export const RendererFallback = cases.RendererFallback
export const Disabled = cases.Disabled
export const Loading = cases.Loading
export const Empty = cases.Empty
export const WithError = cases.WithError
export const LongContent = cases.LongContent
export const ModelLibrary = cases.ModelLibrary
export const CustomModels = cases.CustomModels
export const Layers = cases.Layers
export const Scenario = cases.Scenario
export const Narrow = cases.Narrow
export const Edit3D = cases.Edit3D
export const Animations = cases.Animations
