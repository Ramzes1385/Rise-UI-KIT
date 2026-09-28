import { args } from './args'
import * as cases from './cases'
import { render } from './render'
import { argTypes } from './argTypes'
import BaseUser from '../ui/BaseUser.vue'
import { parameters } from './parameters'
import type { Meta } from '@storybook/vue3-vite'

const meta = {
	title: 'Element/BaseUser',
	component: BaseUser,
	parameters,
	argTypes,
	args,
	render,
} satisfies Meta<typeof BaseUser>

export default meta

export const Default = cases.Default
export const Sizes = cases.Sizes
export const Vertical = cases.Vertical
export const LongContent = cases.LongContent
export const ProfileLink = cases.ProfileLink
export const CustomDescription = cases.CustomDescription
