import { args } from './args'
import * as cases from './cases'
import { argTypes } from './argTypes'
import { parameters } from './parameters'
import type { ConcreteComponent } from 'vue'
import BaseMarquee from '../ui/BaseMarquee.vue'
import type { Meta } from '@storybook/vue3-vite'
import type { BaseMarqueeProps } from '../types/BaseMarquee.types'

const meta = {
	title: 'Element/BaseMarquee',
	component: BaseMarquee as unknown as ConcreteComponent<BaseMarqueeProps<string>>,
	parameters,
	argTypes,
	args,
} satisfies Meta<BaseMarqueeProps<string>>

export default meta

export const Default = cases.Default
export const Variants = cases.Variants
export const Sizes = cases.Sizes
export const CustomColor = cases.CustomColor
