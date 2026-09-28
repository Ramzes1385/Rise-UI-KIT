import { args } from './args'
import * as cases from './cases'
import { render } from './render'
import { argTypes } from './argTypes'
import { parameters } from './parameters'
import type { Meta } from '@storybook/vue3-vite'
import BaseContainer from '../ui/BaseContainer.vue'

const meta = {
	title: 'Layout/BaseContainer',
	component: BaseContainer,
	parameters,
	argTypes,
	args,
	render,
} satisfies Meta<typeof BaseContainer>

export default meta

export const Default = cases.Default
export const Sizes = cases.Sizes
