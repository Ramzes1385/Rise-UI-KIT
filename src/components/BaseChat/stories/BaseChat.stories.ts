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
export const Sending = cases.Sending
export const LongContent = cases.LongContent
export const Group = cases.Group
export const DateSeparators = cases.DateSeparators
export const Unread = cases.Unread
export const LoadMore = cases.LoadMore
export const Badges = cases.Badges
export const Reply = cases.Reply
export const Delete = cases.Delete
export const Editing = cases.Editing
export const Attachments = cases.Attachments
export const Reactions = cases.Reactions
export const Pinned = cases.Pinned
export const PinnedProp = cases.PinnedProp
export const Search = cases.Search
export const Selection = cases.Selection
export const InfoPanel = cases.InfoPanel
export const MentionsAndCommands = cases.MentionsAndCommands
export const MentionEnter = cases.MentionEnter
export const Keyboard = cases.Keyboard
export const EmojiPicker = cases.EmojiPicker
export const VoiceMessages = cases.VoiceMessages
export const Theming = cases.Theming
export const Animations = cases.Animations
