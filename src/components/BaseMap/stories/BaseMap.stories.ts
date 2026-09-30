import { args } from './args'
import * as cases from './cases'
import { argTypes } from './argTypes'
import BaseMap from '../ui/BaseMap.vue'
import { parameters } from './parameters'
import type { Meta } from '@storybook/vue3-vite'

const meta = {
	title: 'Media/BaseMap',
	component: BaseMap,
	parameters,
	argTypes,
	args,
} satisfies Meta<typeof BaseMap>

export default meta

export const Default = cases.Default
export const Markers = cases.Markers
export const Providers = cases.Providers
export const Variants = cases.Variants
export const Sizes = cases.Sizes
export const Loading = cases.Loading
