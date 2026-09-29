import type BaseChat from '../ui/BaseChat.vue'
import type { Meta } from '@storybook/vue3-vite'
import { CHAT_VARIANTS } from '../types/BaseChat.types'
import { baseArgTypes, propGroup, ARG_GROUP } from '@/stories/helpers'

export const argTypes = {
	...baseArgTypes({ variants: CHAT_VARIANTS }),
	messages: { control: 'object', table: propGroup(ARG_GROUP.content) },
	title: { control: 'text', table: propGroup(ARG_GROUP.content) },
	subtitle: { control: 'text', table: propGroup(ARG_GROUP.content) },
	avatar: { control: 'text', table: propGroup(ARG_GROUP.content) },
	description: { control: 'text', table: propGroup(ARG_GROUP.content) },
	hasVoiceMessages: { control: 'boolean', table: propGroup(ARG_GROUP.behavior) },
	members: { control: 'object', table: propGroup(ARG_GROUP.content) },
	quickReplies: { control: 'object', table: propGroup(ARG_GROUP.content) },
	commands: { control: 'object', table: propGroup(ARG_GROUP.content) },
	pinnedMessages: { control: false, table: propGroup(ARG_GROUP.content) },
	height: { control: 'text', table: propGroup(ARG_GROUP.appearance) },
	isTyping: { control: 'boolean', table: propGroup(ARG_GROUP.state) },
	typingUsername: { control: 'text', table: propGroup(ARG_GROUP.state) },
	isGroup: { control: 'boolean', table: propGroup(ARG_GROUP.behavior) },
	currentUserRole: { control: 'inline-radio', options: ['member', 'admin'], table: propGroup(ARG_GROUP.behavior) },
} satisfies Meta<typeof BaseChat>['argTypes']
