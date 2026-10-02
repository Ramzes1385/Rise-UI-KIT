import { args } from './args'
import * as cases from './cases'
import { argTypes } from './argTypes'
import BaseList from '../ui/BaseList.vue'
import { parameters } from './parameters'
import type { ConcreteComponent } from 'vue'
import type { Meta } from '@storybook/vue3-vite'
import type { BaseListProps } from '../types/BaseList.types'

const meta = {
	title: 'Data/BaseList',
	component: BaseList as unknown as ConcreteComponent<BaseListProps>,
	parameters,
	argTypes,
	args,
} satisfies Meta<BaseListProps>

export default meta

export const Default = cases.Default
export const Variants = cases.Variants
export const Sizes = cases.Sizes
export const CustomColor = cases.CustomColor
export const Disabled = cases.Disabled
export const WithError = cases.WithError
export const Empty = cases.Empty
export const LongContent = cases.LongContent
