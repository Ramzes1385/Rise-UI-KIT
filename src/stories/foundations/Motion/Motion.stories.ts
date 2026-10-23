import '../foundations.scss'
import * as cases from './cases'
import { parameters } from './parameters'
import type { Meta } from '@storybook/vue3-vite'

const meta = {
	title: 'Foundations/Motion',
	parameters,
} satisfies Meta

export default meta

export const Tokens = cases.Tokens
export const Easings = cases.Easings
export const Enter = cases.Enter
