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
export const Variants = cases.Variants
export const Sizes = cases.Sizes
export const Theming = cases.Theming
export const Compact = cases.Compact
export const Rtl = cases.Rtl
export const Directions = cases.Directions
export const Routing = cases.Routing
export const Lanes = cases.Lanes
export const Disabled = cases.Disabled
export const Loading = cases.Loading
export const WithError = cases.WithError
export const Empty = cases.Empty
export const LiveStatus = cases.LiveStatus
export const LongContent = cases.LongContent
export const Slots = cases.Slots
export const CustomNotation = cases.CustomNotation
export const ListView = cases.ListView
export const Animations = cases.Animations
export const Keyboard = cases.Keyboard
export const Search = cases.Search
export const Controller = cases.Controller
export const Events = cases.Events
export const Performance = cases.Performance
