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
			<BaseCheckbox :model-value="isSelected" :size-scale="sizeScale * UI_SCALE.SMALL" @update:model-value="handleSelect" />
		</div>

		<BaseAvatar
			v-if="message.sender === 'other' && message.senderAvatar"
			:src="message.senderAvatar"
			:name="message.senderName || 'Companion'"
			:size-scale="sizeScale * UI_SCALE.SMALL"
			class="base-chat-message-list__avatar"
			@click.stop="handleAvatarClick" />

		<div class="base-chat-message-list__bubble-wrapper">
			<div class="base-chat-message-list__bubble" @contextmenu.prevent="handleContextMenu">
				<div v-if="!isSelectionMode" class="base-chat-message-list__actions">
					<BaseButton
						variant="ghost"
						:padding="1"
						:size-scale="sizeScale * UI_CHAT_SCALE_ICON"
						class="base-chat-message-list__action-btn"
						:aria-label="UI_CHAT_REPLY_ARIA"
						@click.stop="handleReplyAction">
						<template #left>
							<BaseIcon name="reply" :size-scale="sizeScale * UI_CHAT_SCALE_META" />
						</template>
					</BaseButton>
					<BaseButton
						variant="ghost"
						:padding="1"
						:size-scale="sizeScale * UI_CHAT_SCALE_ICON"
						class="base-chat-message-list__action-btn"
						:aria-label="UI_CHAT_SELECT_ARIA"
						@click.stop="handleSelect">
						<template #left>
							<BaseIcon name="check" :size-scale="sizeScale * UI_CHAT_SCALE_META" />
						</template>
					</BaseButton>
				</div>

				<BaseText
					v-if="isGroup && message.sender === 'other' && message.senderName"
					tag="span"
					:weight="UI_FONT_WEIGHT.SEMIBOLD"
					:size-scale="sizeScale * UI_SCALE.SMALL"
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
						:size-scale="sizeScale * UI_CHAT_SCALE_SUBTEXT"
						class="base-chat-message-list__pin-icon" />
					<BaseText tag="span" :size-scale="sizeScale * UI_CHAT_SCALE_ICON" class="base-chat-message-list__time">
						{{ message.time }}
					</BaseText>
					<template v-if="message.sender === 'me' && message.status">
						<BaseLoader
							v-if="message.status === 'sending'"
							variant="spinner"
							:size-scale="sizeScale * UI_CHAT_SCALE_SPINNER"
							class="base-chat-message-list__status base-chat-message-list__status--sending" />
						<div
							v-else
							class="base-chat-message-list__status-wrapper"
							:class="`base-chat-message-list__status-wrapper--${message.status}`">
							<BaseIcon name="check" :size-scale="sizeScale * UI_CHAT_SCALE_STATUS" class="base-chat-message-list__status-icon" />
							<BaseIcon
								v-if="message.status === 'read' || message.status === 'delivered'"
								name="check"
								:size-scale="sizeScale * UI_CHAT_SCALE_STATUS"
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
import {
	UI_CHAT_REPLY_ARIA,
	UI_CHAT_SCALE_ICON,
	UI_CHAT_SCALE_META,
	UI_CHAT_SCALE_SPINNER,
	UI_CHAT_SCALE_STATUS,
	UI_CHAT_SCALE_SUBTEXT,
	UI_CHAT_SELECT_ARIA,
	UI_FONT_WEIGHT,
	UI_SCALE,
} from '@constants'
import { computed } from 'vue'
import type { ChatMessage, ChatMessageAttachment } from '../../model/BaseChat.types'
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

const props = withDefaults(defineProps<ChatMessageProps>(), {
	isGroup: false,
	isSelectionMode: false,
	isSelected: false,
	isContextActive: false,
	searchQuery: '',
	allImagesUrls: () => [],
})

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
	props.allImagesUrls.length > 0 ? props.allImagesUrls : getMessageImageUrls(props.message),
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
