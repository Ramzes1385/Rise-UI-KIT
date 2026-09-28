import '../foundations.scss'
import * as cases from './cases'
import { parameters } from './parameters'
import type { Meta } from '@storybook/vue3-vite'

const meta = {
	title: 'Foundations/Colors',
	parameters,
} satisfies Meta

export default meta

export const Semantic = cases.Semantic
export const Roles = cases.Roles
export const Palettes = cases.Palettes
