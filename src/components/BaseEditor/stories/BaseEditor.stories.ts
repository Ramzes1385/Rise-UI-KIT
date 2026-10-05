import { args } from './args'
import * as cases from './cases'
import { render } from './render'
import { argTypes } from './argTypes'
import { parameters } from './parameters'
import BaseEditor from '../ui/BaseEditor.vue'
import type { Meta } from '@storybook/vue3-vite'

const meta = {
	title: 'Editor/BaseEditor',
	component: BaseEditor,
	parameters,
	argTypes,
	args,
	render,
} satisfies Meta<typeof BaseEditor>

export default meta

export const Default = cases.Default
export const Variants = cases.Variants
export const Sizes = cases.Sizes
export const CustomColor = cases.CustomColor
export const Empty = cases.Empty
export const Readonly = cases.Readonly
export const Loading = cases.Loading
export const LongContent = cases.LongContent
export const FormattedContent = cases.FormattedContent
export const ToolbarModes = cases.ToolbarModes
export const ToolbarFormatting = cases.ToolbarFormatting
export const MediaAndLinks = cases.MediaAndLinks
export const CodeMode = cases.CodeMode
export const SanitizedContent = cases.SanitizedContent
export const Keyboard = cases.Keyboard
export const Theming = cases.Theming
export const Animations = cases.Animations
