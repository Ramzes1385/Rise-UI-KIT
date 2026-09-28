import '../foundations.scss'
import * as cases from './cases'
import { parameters } from './parameters'
import type { Meta } from '@storybook/vue3-vite'

const meta = {
	title: 'Foundations/Theming',
	parameters,
} satisfies Meta

export default meta

export const LightAndDark = cases.LightAndDark
export const BrandColor = cases.BrandColor
export const Radius = cases.Radius
