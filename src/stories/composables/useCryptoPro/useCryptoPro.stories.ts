import * as cases from './cases'
import { parameters } from './parameters'
import type { Meta } from '@storybook/vue3-vite'

const meta = {
	title: 'Composables/useCryptoPro',
	parameters,
} satisfies Meta

export default meta

export const Diagnostics = cases.Diagnostics
export const Certificates = cases.Certificates
export const Sign = cases.Sign
export const NoScript = cases.NoScript
export const NoExtension = cases.NoExtension
export const NoCertificates = cases.NoCertificates
export const Cancelled = cases.Cancelled
