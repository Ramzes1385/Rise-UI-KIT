import { args } from './args'
import * as cases from './cases'
import { argTypes } from './argTypes'
import { parameters } from './parameters'
import type { Meta } from '@storybook/vue3-vite'
import BaseTagGroup from '../ui/BaseTagGroup.vue'

const meta = {
	title: 'Element/BaseTagGroup',
	component: BaseTagGroup,
	parameters,
	argTypes,
	args,
} satisfies Meta<typeof BaseTagGroup>

export default meta

export const Default = cases.Default
export const Single = cases.Single
export const Removable = cases.Removable
export const Tones = cases.Tones
export const CustomTag = cases.CustomTag
export const LongContent = cases.LongContent
export const Empty = cases.Empty
export const Disabled = cases.Disabled
