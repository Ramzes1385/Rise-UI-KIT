import { args } from './args'
import * as cases from './cases'
import { argTypes } from './argTypes'
import { parameters } from './parameters'
import BaseFlowMap from '../ui/BaseFlowMap.vue'
import type { Meta } from '@storybook/vue3-vite'

const meta = {
	title: 'Data/BaseFlowMap',
	component: BaseFlowMap,
	parameters,
	argTypes,
	args,
} satisfies Meta<typeof BaseFlowMap>

export default meta

export const Default = cases.Default
export const Disabled = cases.Disabled
export const Loading = cases.Loading
export const WithError = cases.WithError
export const Empty = cases.Empty
export const LongContent = cases.LongContent
