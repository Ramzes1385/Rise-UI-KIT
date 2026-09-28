<template>
	<div
		:id="`message-${message.id}`"
		class="base-chat-message-list__item"
		:class="[
			`base-chat-message-list__item--${message.sender}`,
			{
				'base-chat-message-list__item--has-avatar': hasAvatar,
				'base-chat-message-list__item--selected': isSelected,
				'base-chat-message-list__item--context-active': isContextActive,
				'base-chat-message-list__item--has-reactions': message.reactions && message.reactions.length > 0,
			},
		]"
		@click="isSelectionMode ? handleSelect() : undefined"
		@contextmenu.prevent="handleContextMenu">
		<div v-if="isSelectionMode" class="base-chat-message-list__checkbox-wrapper" @click.stop>
			<BaseCheckbox
				:model-value="isSelected"
				:label="UI_CHAT_TEXT.SELECT_ARIA"
				:size-scale="sizeScale"
				class="base-chat-message-list__checkbox"
				@update:model-value="handleSelect" />
		</div>

		<!-- Аватар открывает профиль отправителя. Если рядом есть кнопка с именем, аватар дублирует её
			и не попадает в порядок Tab -->
		<button
			v-if="hasAvatar"
			type="button"
			class="base-chat-message-list__avatar-button"
			:tabindex="showSenderName ? -1 : undefined"
			:aria-label="avatarLabel"
			@click.stop="handleAvatarClick">
			<BaseAvatar :src="message.senderAvatar" :name="senderName" :size-scale="sizeScale" class="base-chat-message-list__avatar" />
		</button>

		<div class="base-chat-message-list__bubble-wrapper">
			<button v-if="showSenderName" type="button" class="base-chat-message-list__sender-name" @click.stop="handleAvatarClick">
				{{ message.senderName }}
			</button>

			<div class="base-chat-message-list__bubble">
				<!-- Действия появляются при наведении и при фокусе внутри сообщения (клавиатура) -->
				<div
					v-if="!isSelectionMode"
					class="base-chat-message-list__actions"
					role="group"
					:aria-label="UI_CHAT_TEXT.MESSAGE_ACTIONS">
					<BaseButton
						variant="ghost"
						:size-scale="sizeScale"
						class="base-chat-message-list__action-btn"
						:aria-label="UI_CHAT_TEXT.REPLY_ARIA"
						@click.stop="handleReplyAction">
						<BaseIcon name="reply" :size-scale="sizeScale * CHAT_SCALE.SMALL" />
					</BaseButton>
					<BaseButton
						variant="ghost"
						:size-scale="sizeScale"
						class="base-chat-message-list__action-btn"
						:aria-label="UI_CHAT_TEXT.SELECT_ARIA"
						@click.stop="handleSelect">
						<BaseIcon name="check" :size-scale="sizeScale * CHAT_SCALE.SMALL" />
					</BaseButton>
					<BaseButton
						variant="ghost"
						:size-scale="sizeScale"
						class="base-chat-message-list__action-btn"
						:aria-label="UI_CHAT_TEXT.MORE_ACTIONS_ARIA"
						aria-haspopup="menu"
						:aria-expanded="isContextActive ? 'true' : 'false'"
						@click.stop="handleMoreClick">
						<BaseIcon name="dots-horizontal" :size-scale="sizeScale * CHAT_SCALE.SMALL" />
					</BaseButton>
				</div>

				<ChatMessageReply
					:reply-to-id="message.replyToId"
					:reply-to-sender-name="message.replyToSenderName"
					:reply-to-text="message.replyToText"
					:size-scale="sizeScale"
					@click="handleReplyClick" />

				<ChatMessageAttachments
					:attachments="message.attachments || []"
					:size-scale="sizeScale"
					:gallery="gallery"
					@download="handleDownload"
					@file-click="handleFileClick" />

				<ChatMessageText
					:text="message.text"
					:size-scale="sizeScale"
					:search-query="searchQuery"
					@mention-click="handleMentionClick"
					@command-click="handleCommandClick" />
			</div>

			<div class="base-chat-message-list__footer">
				<ChatMessageReactions :reactions="message.reactions || []" :sender="message.sender" @toggle="handleReactionToggle" />

				<div class="base-chat-message-list__meta">
					<BaseIcon
						v-if="message.isPinned"
						name="pin"
						:aria-label="UI_CHAT_TEXT.PINNED_LABEL"
						:size-scale="sizeScale * CHAT_SCALE.STATUS"
						class="base-chat-message-list__pin-icon" />
					<span class="base-chat-message-list__time">{{ message.time }}</span>
					<template v-if="message.sender === 'me' && message.status">
						<BaseLoader
							v-if="message.status === 'sending'"
							variant="spinner"
							:label="UI_CHAT_TEXT.STATUS_SENDING"
							:size-scale="sizeScale * CHAT_SCALE.SPINNER"
							class="base-chat-message-list__status base-chat-message-list__status--sending" />
						<span
							v-else
							class="base-chat-message-list__status-wrapper"
							:class="`base-chat-message-list__status-wrapper--${message.status}`"
							role="img"
							:aria-label="statusLabel">
							<BaseIcon
								name="check"
								:size-scale="sizeScale * CHAT_SCALE.STATUS"
								class="base-chat-message-list__status-icon" />
							<BaseIcon
								v-if="message.status === 'read' || message.status === 'delivered'"
								name="check"
								:size-scale="sizeScale * CHAT_SCALE.STATUS"
								class="base-chat-message-list__status-icon base-chat-message-list__status-icon--second" />
						</span>
					</template>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { BaseIcon } from '@components/BaseIcon'
import { UI_CHAT_TEXT } from '@/locales/messages'
import { BaseAvatar } from '@components/BaseAvatar'
import { BaseButton } from '@components/BaseButton'
import { BaseLoader } from '@components/BaseLoader'
import { BaseCheckbox } from '@components/BaseCheckbox'
import ChatMessageText from './ChatMessageText.vue'
import { CHAT_SCALE } from '../../../model/chatScale'
import ChatMessageReply from './ChatMessageReply.vue'
import ChatMessageReactions from './ChatMessageReactions.vue'
import ChatMessageAttachments from './ChatMessageAttachments.vue'
import type { ChatMessageItemEmits, ChatMessageItemProps } from '../types/ChatMessageItem.types'
import type { ChatMessage, ChatMessageAttachment, ChatMessageStatus } from '../../../types/BaseChat.types'

const props = withDefaults(defineProps<ChatMessageItemProps>(), {
	isGroup: false,
	isSelectionMode: false,
	isSelected: false,
	isContextActive: false,
	searchQuery: '',
	allImagesUrls: () => [],
})

const emit = defineEmits<ChatMessageItemEmits>()

/** Доступные названия статусов доставки: галочки передают статус не только цветом */
const STATUS_LABELS: Record<Exclude<ChatMessageStatus, 'sending'>, string> = {
	sent: UI_CHAT_TEXT.STATUS_SENT,
	delivered: UI_CHAT_TEXT.STATUS_DELIVERED,
	read: UI_CHAT_TEXT.STATUS_READ,
}

const hasAvatar = computed(() => props.message.sender === 'other' && Boolean(props.message.senderAvatar))
const showSenderName = computed(() => props.isGroup && props.message.sender === 'other' && Boolean(props.message.senderName))
const senderName = computed(() => props.message.senderName || 'Companion')
const avatarLabel = computed(() =>
	props.message.senderName ? `${UI_CHAT_TEXT.PROFILE_ARIA} ${props.message.senderName}` : UI_CHAT_TEXT.SENDER_PROFILE_ARIA,
)
const statusLabel = computed(() =>
	props.message.status && props.message.status !== 'sending' ? STATUS_LABELS[props.message.status] : undefined,
)

const gallery = computed(() => (props.allImagesUrls.length > 0 ? props.allImagesUrls : getMessageImageUrls(props.message)))

function getMessageImageUrls(message: ChatMessage): string[] {
	return message.attachments?.filter(attachment => attachment.type === 'image').map(attachment => attachment.url) ?? []
}

function handleSelect(): void {
	emit('select')
}

function handleAvatarClick(): void {
	emit('avatar-click')
}

function handleReplyAction(): void {
	emit('reply-action')
}

function handleContextMenu(payload: MouseEvent): void {
	emit('context-menu', payload)
}

/**
 * Кнопка «Другие действия» открывает то же меню, что и правый клик. При нажатии с клавиатуры у события нет координат
 * указателя, поэтому меню ставится под кнопкой.
 */
function handleMoreClick(event: MouseEvent): void {
	const button = event.currentTarget as HTMLElement
	const rect = button.getBoundingClientRect()
	emit('context-menu', new MouseEvent('contextmenu', { clientX: rect.left, clientY: rect.bottom + 4 }))
}

function handleReplyClick(replyToId?: string): void {
	if (replyToId) {
		emit('reply-click', replyToId)
	}
}

function handleDownload(file: ChatMessageAttachment): void {
	emit('download', file)
}

function handleFileClick(file: ChatMessageAttachment): void {
	emit('file-click', file)
}

function handleMentionClick(mention: string): void {
	emit('mention-click', mention)
}

function handleCommandClick(command: string): void {
	emit('command-click', command)
}

function handleReactionToggle(emoji: string): void {
	emit('reaction-toggle', emoji)
}
</script>
