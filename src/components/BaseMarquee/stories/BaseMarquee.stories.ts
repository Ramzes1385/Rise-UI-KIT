import { args } from './args'
import * as cases from './cases'
import { render } from './render'
import { argTypes } from './argTypes'
import { parameters } from './parameters'
import type { ConcreteComponent } from 'vue'
import BaseMarquee from '../ui/BaseMarquee.vue'
import type { MarqueeStoryArgs } from './shared'
import type { Meta } from '@storybook/vue3-vite'

const meta = {
	title: 'Element/BaseMarquee',
	component: BaseMarquee as unknown as ConcreteComponent<MarqueeStoryArgs>,
	parameters,
	argTypes,
	args,
	render,
} satisfies Meta<MarqueeStoryArgs>

export default meta

export const Default = cases.Default
export const Variants = cases.Variants
export const Sizes = cases.Sizes
export const News = cases.News
export const Logos = cases.Logos
export const Directions = cases.Directions
export const Vertical = cases.Vertical
export const CustomColor = cases.CustomColor
export const Keyboard = cases.Keyboard
export const ReducedMotion = cases.ReducedMotion
export const Theming = cases.Theming
export const Animations = cases.Animations
