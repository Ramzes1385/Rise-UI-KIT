import '../foundations.scss'
import * as cases from './cases'
import { parameters } from './parameters'
import type { Meta } from '@storybook/vue3-vite'

const meta = {
	title: 'Foundations/Typography',
	parameters,
} satisfies Meta

export default meta

export const Scale = cases.Scale
export const Weights = cases.Weights
export const Families = cases.Families
