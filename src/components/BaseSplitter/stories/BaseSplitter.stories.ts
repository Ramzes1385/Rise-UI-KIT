import { args } from './args'
import * as cases from './cases'
import { render } from './render'
import { argTypes } from './argTypes'
import { parameters } from './parameters'
import type { Meta } from '@storybook/vue3-vite'
import BaseSplitter from '../ui/BaseSplitter.vue'

const meta = {
	title: 'Layout/BaseSplitter',
	component: BaseSplitter,
	parameters,
	argTypes,
	args,
	render,
} satisfies Meta<typeof BaseSplitter>

export default meta

export const Default = cases.Default
export const Vertical = cases.Vertical
export const Variants = cases.Variants
export const Disabled = cases.Disabled
export const Mail = cases.Mail
export const Ide = cases.Ide
export const Dashboard = cases.Dashboard
export const ImageAndText = cases.ImageAndText
export const Svg = cases.Svg
export const Components = cases.Components
export const FileTree = cases.FileTree
export const Nested = cases.Nested
export const Media = cases.Media
export const Keyboard = cases.Keyboard
export const Theming = cases.Theming
export const Animations = cases.Animations
