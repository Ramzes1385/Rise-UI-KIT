import { args } from './args'
import * as cases from './cases'
import { argTypes } from './argTypes'
import { parameters } from './parameters'
import type { Meta } from '@storybook/vue3-vite'
import BaseBankCard from '../ui/BaseBankCard.vue'

const meta = {
	title: 'Element/BaseBankCard',
	component: BaseBankCard,
	parameters,
	argTypes,
	args,
} satisfies Meta<typeof BaseBankCard>

export default meta

export const Default = cases.Default
export const Variants = cases.Variants
export const Sizes = cases.Sizes
export const CustomColor = cases.CustomColor
export const Cover = cases.Cover
export const Expired = cases.Expired
export const WithoutBrand = cases.WithoutBrand
export const BrandIcons = cases.BrandIcons
export const CoverSlot = cases.CoverSlot
export const SavedCards = cases.SavedCards
