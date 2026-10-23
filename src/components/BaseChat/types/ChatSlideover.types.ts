import type { PropsWithDefaults } from '@composables/base/useDefaults'
import type { ChatInfoTab, ChatMember, ChatMessage, ChatMessageAttachment } from './BaseChat.types'

export interface ChatSlideoverProps {
	isOpen: boolean
	activeTab: ChatInfoTab
	selectedMemberId: string | null
	title: string
	subtitle?: string
	avatar?: string
	/** Описание чата или собеседника во вкладке «Инфо»; без него блок описания не выводится */
	description?: string
	isGroup?: boolean
	members?: ChatMember[]
	messages: ChatMessage[]
	currentUserRole?: 'admin' | 'member'
	/** Идентификатор текущего пользователя: действия админа над самим собой не показываются (по умолчанию — участник `me`) */
	currentUserId?: string
	/** Статус собеседника в личном чате; без него определяется по тексту `subtitle` */
	companionStatus?: 'online' | 'offline'
	/** Сколько предупреждений ведёт к блокировке (в профиле «2 из 3»); `member.maxWarnings` главнее */
	maxWarnings?: number
	/** Сколько значков видно рядом с именем в списке участников; полный список — в профиле */
	maxBadges?: number
	sizeScale?: number
}

export interface ChatSlideoverEmits {
	(e: 'update:isOpen', value: boolean): void
	(e: 'update:activeTab', tab: ChatInfoTab): void
	(e: 'update:selectedMemberId', id: string | null): void
	(e: 'file-click', file: ChatMessageAttachment): void
	(e: 'download-file', file: ChatMessageAttachment): void
	(e: 'write-message', memberId: string): void
	(e: 'add-member'): void
	(e: 'kick-member', memberId: string): void
	(e: 'ban-member', payload: { memberId: string; reason?: string; warningsCount?: number }): void
	(e: 'update-member-role', payload: { memberId: string; role: string }): void
}

/** Вложение с датой публикации — во вкладках «Медиа» и «Файлы» */
export interface SharedAttachment extends ChatMessageAttachment {
	publishedAt: string
}

export type ChatSlideoverPanelProps = PropsWithDefaults<ChatSlideoverProps, 'subtitle' | 'avatar' | 'isGroup' | 'members' | 'maxWarnings'>
