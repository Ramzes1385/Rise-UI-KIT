import { args } from './args'
import * as cases from './cases'
import { argTypes } from './argTypes'
import { parameters } from './parameters'
import BaseQrCode from '../ui/BaseQrCode.vue'
import type { Meta } from '@storybook/vue3-vite'

const meta = {
	title: 'Element/BaseQrCode',
	component: BaseQrCode,
	parameters,
	argTypes,
	args,
} satisfies Meta<typeof BaseQrCode>

export default meta

export const Default = cases.Default
export const Variants = cases.Variants
export const Sizes = cases.Sizes
export const Shapes = cases.Shapes
export const Logo = cases.Logo
export const CustomColor = cases.CustomColor
export const ShowValue = cases.ShowValue
export const GostPayment = cases.GostPayment
export const SbpPayment = cases.SbpPayment
export const ErrorCorrection = cases.ErrorCorrection
export const Concealed = cases.Concealed
export const TooLong = cases.TooLong
