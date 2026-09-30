import { args } from './args'
import * as cases from './cases'
import { render } from './render'
import { argTypes } from './argTypes'
import { parameters } from './parameters'
import type { Meta } from '@storybook/vue3-vite'
import BaseAvatarGroup from '../ui/BaseAvatarGroup.vue'

const meta = {
	title: 'Element/BaseAvatarGroup',
	component: BaseAvatarGroup,
	parameters,
	argTypes,
	args,
	render,
} satisfies Meta<typeof BaseAvatarGroup>

export default meta

export const Default = cases.Default
export const Variants = cases.Variants
export const Sizes = cases.Sizes
export const Square = cases.Square
export const NoSingleRest = cases.NoSingleRest
export const Media = cases.Media
