import '../foundations.scss'
import * as cases from './cases'
import { parameters } from './parameters'
import type { Meta } from '@storybook/vue3-vite'

const meta = {
	title: 'Foundations/Sizing',
	parameters,
} satisfies Meta

export default meta

export const Presets = cases.Presets
export const Alignment = cases.Alignment
export const Density = cases.Density
