import type { ChatInfoTab, ChatMember, ChatMessage, ChatMessageAttachment } from './BaseChat.types'

export interface ChatSlideoverProps {
	isOpen: boolean
	activeTab: ChatInfoTab
	selectedMemberId: string | null
	title: string
	subtitle?: string
	avatar?: string
	isGroup?: boolean
	members?: ChatMember[]
	messages: ChatMessage[]
	currentUserRole?: 'admin' | 'member'
	sizeScale?: number
}

export interface ChatSlideoverEmits {
	(e: 'update:isOpen', value: boolean): void
	(e: 'update:activeTab', tab: ChatInfoTab): void
	(e: 'update:selectedMemberId', id: string | null): void
	(e: 'file-click', file: ChatMessageAttachment): void
	(e: 'download-file', file: ChatMessageAttachment): void
	(e: 'write-message', memberId: string): void
	(e: 'kick-member', memberId: string): void
	(e: 'ban-member', payload: { memberId: string; reason?: string; warningsCount?: number }): void
	(e: 'update-member-role', payload: { memberId: string; role: string }): void
}
