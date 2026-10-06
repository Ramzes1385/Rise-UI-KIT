import { args } from './args'
import * as cases from './cases'
import { argTypes } from './argTypes'
import { parameters } from './parameters'
import type { Meta } from '@storybook/vue3-vite'
import BaseSubtitleEditor from '../ui/BaseSubtitleEditor.vue'

const meta = {
	title: 'Media/BaseSubtitleEditor',
	component: BaseSubtitleEditor,
	parameters,
	argTypes,
	args,
} satisfies Meta<typeof BaseSubtitleEditor>

export default meta

export const Default = cases.Default
export const WithPlayer = cases.WithPlayer
export const Empty = cases.Empty
export const Disabled = cases.Disabled
export const Theming = cases.Theming
export const Animations = cases.Animations
