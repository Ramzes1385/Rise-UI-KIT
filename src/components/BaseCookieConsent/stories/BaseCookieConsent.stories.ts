import { args } from './args'
import * as cases from './cases'
import { argTypes } from './argTypes'
import { parameters } from './parameters'
import type { Meta } from '@storybook/vue3-vite'
import BaseCookieConsent from '../ui/BaseCookieConsent.vue'

const meta = {
	title: 'Overlay/BaseCookieConsent',
	component: BaseCookieConsent,
	parameters,
	argTypes,
	args,
} satisfies Meta<typeof BaseCookieConsent>

export default meta

export const Default = cases.Default
export const Settings = cases.Settings
export const Positions = cases.Positions
export const Variants = cases.Variants
export const Sizes = cases.Sizes
export const CustomColor = cases.CustomColor
export const LongContent = cases.LongContent
export const Keyboard = cases.Keyboard
export const Remembered = cases.Remembered
export const Theming = cases.Theming
export const Animations = cases.Animations
