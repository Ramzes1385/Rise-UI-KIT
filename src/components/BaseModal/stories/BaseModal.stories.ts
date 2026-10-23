import { args } from './args'
import * as cases from './cases'
import { render } from './render'
import { argTypes } from './argTypes'
import { parameters } from './parameters'
import BaseModal from '../ui/BaseModal.vue'
import type { Meta } from '@storybook/vue3-vite'

const meta = {
	title: 'Overlay/BaseModal',
	component: BaseModal,
	parameters,
	argTypes,
	args,
	render,
} satisfies Meta<typeof BaseModal>

export default meta

export const Default = cases.Default
export const Variants = cases.Variants
export const Sizes = cases.Sizes
export const CustomColor = cases.CustomColor
export const Opened = cases.Opened
export const LongContent = cases.LongContent
export const Contained = cases.Contained
export const NoOverlayClose = cases.NoOverlayClose
export const FullScreen = cases.FullScreen
export const WithList = cases.WithList
export const FromPopover = cases.FromPopover
export const Keyboard = cases.Keyboard
export const Blocking = cases.Blocking
export const Theming = cases.Theming
export const Animations = cases.Animations
