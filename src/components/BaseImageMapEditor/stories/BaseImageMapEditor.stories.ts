import { args } from './args'
import * as cases from './cases'
import { render } from './render'
import { argTypes } from './argTypes'
import { parameters } from './parameters'
import type { Meta } from '@storybook/vue3-vite'
import BaseImageMapEditor from '../ui/BaseImageMapEditor.vue'

const meta = {
	title: 'Media/BaseImageMapEditor',
	component: BaseImageMapEditor,
	parameters,
	argTypes,
	args,
	render,
} satisfies Meta<typeof BaseImageMapEditor>

export default meta

export const Default = cases.Default
export const Variants = cases.Variants
export const Theming = cases.Theming
export const Narrow = cases.Narrow
export const Disabled = cases.Disabled
export const WithError = cases.WithError
export const Empty = cases.Empty
export const Floors = cases.Floors
export const Groups = cases.Groups
export const DeleteConfirm = cases.DeleteConfirm
export const Zoom = cases.Zoom
export const LongContent = cases.LongContent
export const Preview = cases.Preview
export const CustomToolbar = cases.CustomToolbar
export const MouseEditing = cases.MouseEditing
export const Keyboard = cases.Keyboard
export const Fields3D = cases.Fields3D
export const EditorFilters = cases.EditorFilters
export const EditorStyles = cases.EditorStyles
export const EditorParts3D = cases.EditorParts3D
export const Animations = cases.Animations
