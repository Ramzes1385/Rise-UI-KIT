import { args } from './args'
import * as cases from './cases'
import { argTypes } from './argTypes'
import { parameters } from './parameters'
import type { ConcreteComponent } from 'vue'
import type { Meta } from '@storybook/vue3-vite'
import BaseTransfer from '../ui/BaseTransfer.vue'
import type { BaseTransferProps } from '../types/BaseTransfer.types'

const meta = {
	title: 'Form/BaseTransfer',
	component: BaseTransfer as unknown as ConcreteComponent<BaseTransferProps>,
	parameters,
	argTypes,
	args,
} satisfies Meta<BaseTransferProps>

export default meta

export const Default = cases.Default
export const Variants = cases.Variants
export const Sizes = cases.Sizes
export const CustomColor = cases.CustomColor
export const Disabled = cases.Disabled
export const WithError = cases.WithError
export const Empty = cases.Empty
export const LongContent = cases.LongContent
export const Searchable = cases.Searchable
export const Sortable = cases.Sortable
