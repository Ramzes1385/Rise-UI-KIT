import '../foundations.scss'
import * as cases from './cases'
import { parameters } from './parameters'
import type { Meta } from '@storybook/vue3-vite'

const meta = {
	title: 'Foundations/Radius & Shadows',
	parameters,
} satisfies Meta

export default meta

export const Radius = cases.Radius
export const Shadows = cases.Shadows
