import { args } from './args'
import * as cases from './cases'
import { render } from './render'
import { argTypes } from './argTypes'
import { parameters } from './parameters'
import BaseFooter from '../ui/BaseFooter.vue'
import type { Meta } from '@storybook/vue3-vite'

const meta = {
	title: 'Layout/BaseFooter',
	component: BaseFooter,
	parameters,
	argTypes,
	args,
	render,
} satisfies Meta<typeof BaseFooter>

export default meta

export const Default = cases.Default
export const Variants = cases.Variants
export const Simple = cases.Simple
export const Columns = cases.Columns
export const WithSubscribe = cases.WithSubscribe
export const WithApps = cases.WithApps
export const Compact = cases.Compact
export const Seo = cases.Seo
