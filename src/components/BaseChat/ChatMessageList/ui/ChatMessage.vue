<template>
	<div
		:id="`message-${message.id}`"
		class="base-chat-message-list__item"
		:class="[
			`base-chat-message-list__item--${message.sender}`,
			{
				'base-chat-message-list__item--has-avatar': message.senderAvatar,
				'base-chat-message-list__item--selected': isSelected,
				'base-chat-message-list__item--context-active': isContextActive,
				'base-chat-message-list__item--has-reactions': message.reactions && message.reactions.length > 0,
			},
		]"
		@click="isSelectionMode ? handleSelect() : undefined">
		<div v-if="isSelectionMode" class="base-chat-message-list__checkbox-wrapper" @click.stop>
			<BaseCheckbox :model-value="isSelected" :size-scale="sizeScale * UI_SCALE_SMALL" @update:model-value="handleSelect" />
		</div>

		<BaseAvatar
			v-if="message.sender === 'other' && message.senderAvatar"
			:src="message.senderAvatar"
			:name="message.senderName || 'Companion'"
			:size-scale="sizeScale * UI_SCALE_SMALL"
			class="base-chat-message-list__avatar"
			@click.stop="handleAvatarClick" />

		<div class="base-chat-message-list__bubble-wrapper">
			<div class="base-chat-message-list__bubble" @contextmenu.prevent="handleContextMenu">
				<div v-if="!isSelectionMode" class="base-chat-message-list__actions">
					<BaseButton
						variant="ghost"
						:padding="1"
						:size-scale="sizeScale * 0.75"
						class="base-chat-message-list__action-btn"
						aria-label="Ответить на сообщение"
						@click.stop="handleReplyAction">
						<template #left>
							<BaseIcon name="reply" :size-scale="sizeScale * 0.7" />
						</template>
					</BaseButton>
					<BaseButton
						variant="ghost"
						:padding="1"
						:size-scale="sizeScale * 0.75"
						class="base-chat-message-list__action-btn"
						aria-label="Выбрать сообщение"
						@click.stop="handleSelect">
						<template #left>
							<BaseIcon name="check" :size-scale="sizeScale * 0.7" />
						</template>
					</BaseButton>
				</div>

				<BaseText
					v-if="isGroup && message.sender === 'other' && message.senderName"
					tag="span"
					:weight="600"
					:size-scale="sizeScale * UI_SCALE_SMALL"
					class="base-chat-message-list__sender-name"
					@click.stop="handleAvatarClick">
					{{ message.senderName }}
				</BaseText>

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

				<ChatMessageReactions
					:reactions="message.reactions || []"
					:sender="message.sender"
					@toggle="handleReactionToggle" />

				<div class="base-chat-message-list__meta">
					<BaseIcon
						v-if="message.isPinned"
						name="pin"
						:size-scale="sizeScale * 0.65"
						class="base-chat-message-list__pin-icon" />
					<BaseText tag="span" :size-scale="sizeScale * 0.75" class="base-chat-message-list__time">
						{{ message.time }}
					</BaseText>
					<template v-if="message.sender === 'me' && message.status">
						<BaseLoader
							v-if="message.status === 'sending'"
							variant="spinner"
							:size-scale="sizeScale * 0.5"
							class="base-chat-message-list__status base-chat-message-list__status--sending" />
						<div
							v-else
							class="base-chat-message-list__status-wrapper"
							:class="`base-chat-message-list__status-wrapper--${message.status}`">
							<BaseIcon name="check" :size-scale="sizeScale * 0.6" class="base-chat-message-list__status-icon" />
							<BaseIcon
								v-if="message.status === 'read' || message.status === 'delivered'"
								name="check"
								:size-scale="sizeScale * 0.6"
								class="base-chat-message-list__status-icon base-chat-message-list__status-icon--second" />
						</div>
					</template>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { BaseAvatar } from '@components/BaseAvatar'
import { BaseButton } from '@components/BaseButton'
import { BaseCheckbox } from '@components/BaseCheckbox'
import { BaseIcon } from '@components/BaseIcon'
import { BaseLoader } from '@components/BaseLoader'
import { BaseText } from '@components/BaseText'
import { UI_SCALE_SMALL } from '@constants'
import { computed } from 'vue'
import type { ChatMessage, ChatMessageAttachment } from '../../BaseChat.types'
import ChatMessageAttachments from './ChatMessageAttachments.vue'
import ChatMessageReactions from './ChatMessageReactions.vue'
import ChatMessageReply from './ChatMessageReply.vue'
import ChatMessageText from './ChatMessageText.vue'

interface ChatMessageProps {
	message: ChatMessage
	isGroup?: boolean
	isSelectionMode?: boolean
	isSelected?: boolean
	isContextActive?: boolean
	sizeScale: number
	searchQuery?: string
	allImagesUrls?: string[]
}

const props = defineProps<ChatMessageProps>()

const isGroup = computed(() => props.isGroup ?? false)
const isSelectionMode = computed(() => props.isSelectionMode ?? false)
const isSelected = computed(() => props.isSelected ?? false)
const isContextActive = computed(() => props.isContextActive ?? false)
const searchQuery = computed(() => props.searchQuery ?? '')
const allImagesUrls = computed(() => props.allImagesUrls ?? [])

const emit = defineEmits<{
	(event: 'avatar-click'): void
	(event: 'select'): void
	(event: 'reply-action'): void
	(event: 'context-menu', payload: MouseEvent): void
	(event: 'reply-click', replyToId: string): void
	(event: 'download', file: ChatMessageAttachment): void
	(event: 'file-click', file: ChatMessageAttachment): void
	(event: 'mention-click', mention: string): void
	(event: 'command-click', command: string): void
	(event: 'reaction-toggle', emoji: string): void
}>()

const gallery = computed(() =>
	allImagesUrls.value.length > 0 ? allImagesUrls.value : getMessageImageUrls(props.message),
)

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
