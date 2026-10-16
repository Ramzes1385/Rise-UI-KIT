import '../foundations.scss'
import * as cases from './cases'
import { parameters } from './parameters'
import type { Meta } from '@storybook/vue3-vite'

const meta = {
	title: 'Foundations/Localization',
	parameters,
} satisfies Meta

export default meta

export const Language = cases.Language
export const Overrides = cases.Overrides
export const OwnLocale = cases.OwnLocale
export const Formats = cases.Formats
