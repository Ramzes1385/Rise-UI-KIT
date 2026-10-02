import { args } from './args'
import * as cases from './cases'
import { render } from './render'
import { argTypes } from './argTypes'
import BaseApp from '../ui/BaseApp.vue'
import { parameters } from './parameters'
import type { Meta } from '@storybook/vue3-vite'

const meta = {
	title: 'Overlay/BaseApp',
	component: BaseApp,
	parameters,
	argTypes,
	args,
	render,
} satisfies Meta<typeof BaseApp>

export default meta

export const Default = cases.Default
export const UpdateInPlace = cases.UpdateInPlace
export const Actions = cases.Actions
export const OverlayFromCode = cases.OverlayFromCode
export const LayerContainer = cases.LayerContainer
export const LoadingBar = cases.LoadingBar
export const RouterLoadingBar = cases.RouterLoadingBar
