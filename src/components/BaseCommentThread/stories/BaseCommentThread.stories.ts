import { args } from './args'
import * as cases from './cases'
import { argTypes } from './argTypes'
import { parameters } from './parameters'
import type { Meta } from '@storybook/vue3-vite'
import BaseCommentThread from '../ui/BaseCommentThread.vue'

const meta = {
	title: 'Chat/BaseCommentThread',
	component: BaseCommentThread,
	parameters,
	argTypes,
	args,
} satisfies Meta<typeof BaseCommentThread>

export default meta

export const Default = cases.Default
export const Live = cases.Live
export const Collapsed = cases.Collapsed
export const Readonly = cases.Readonly
export const Empty = cases.Empty
export const Variants = cases.Variants
export const Sizes = cases.Sizes
