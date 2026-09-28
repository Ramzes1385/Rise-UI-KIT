import { args } from './args'
import * as cases from './cases'
import { render } from './render'
import { argTypes } from './argTypes'
import BaseChat from '../ui/BaseChat.vue'
import { parameters } from './parameters'
import type { Meta } from '@storybook/vue3-vite'

const meta = {
	title: 'Chat/BaseChat',
	component: BaseChat,
	parameters,
	argTypes,
	args,
	render,
} satisfies Meta<typeof BaseChat>

export default meta

export const Default = cases.Default
export const Variants = cases.Variants
export const Sizes = cases.Sizes
export const CustomColor = cases.CustomColor
export const Empty = cases.Empty
export const Loading = cases.Loading
export const LongContent = cases.LongContent
export const Group = cases.Group
export const Reply = cases.Reply
export const Delete = cases.Delete
export const Attachments = cases.Attachments
export const Reactions = cases.Reactions
export const Pinned = cases.Pinned
export const Search = cases.Search
export const Selection = cases.Selection
export const InfoPanel = cases.InfoPanel
export const MentionsAndCommands = cases.MentionsAndCommands
export const Keyboard = cases.Keyboard
