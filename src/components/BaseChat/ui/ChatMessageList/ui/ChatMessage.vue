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
			<div v-if="showSenderName" class="base-chat-message-list__sender">
				<button type="button" class="base-chat-message-list__sender-name" @click.stop="handleAvatarClick">
					{{ message.senderName }}
				</button>
				<ChatBadges v-if="badges.length > 0" :badges="badges" :max="maxBadges" :size-scale="sizeScale" />
			</div>

			<div class="base-chat-message-list__bubble" :class="bubbleClass">
				<div
					v-if="!isSelectionMode && !isFailed"
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
					<span v-if="message.isEdited" class="base-chat-message-list__edited">{{ UI_CHAT_TEXT.EDITED }}</span>
					<span class="base-chat-message-list__time">{{ message.time }}</span>
					<template v-if="message.sender === 'me' && message.status && message.status !== 'failed'">
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

			<div v-if="isFailed" class="base-chat-message-list__failed" role="group" :aria-label="UI_CHAT_TEXT.STATUS_FAILED">
				<span class="base-chat-message-list__failed-text" role="status">
					<BaseIcon name="alert-triangle" :size-scale="sizeScale * CHAT_SCALE.STATUS" />
					{{ UI_CHAT_TEXT.STATUS_FAILED }}
				</span>
				<BaseButton
					variant="ghost"
					:size-scale="sizeScale"
					:padding="2"
					class="base-chat-message-list__failed-btn"
					:aria-label="UI_CHAT_TEXT.RETRY_ARIA"
					@click.stop="handleRetry">
					{{ UI_CHAT_TEXT.RETRY }}
				</BaseButton>
				<BaseButton
					variant="ghost"
					:size-scale="sizeScale"
					:padding="2"
					class="base-chat-message-list__failed-btn base-chat-message-list__failed-btn--danger"
					:aria-label="UI_CHAT_TEXT.DISCARD_ARIA"
					@click.stop="handleDiscard">
					{{ UI_CHAT_TEXT.DELETE }}
				</BaseButton>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { BaseIcon } from '@components/BaseIcon'
import { UI_CHAT_TEXT } from '@/locales/messages'
import ChatMessageText from './ChatMessageText.vue'
import { BaseAvatar } from '@components/BaseAvatar'
import { BaseButton } from '@components/BaseButton'
import { BaseLoader } from '@components/BaseLoader'
import { CHAT_SCALE } from '../../../model/chatScale'
import ChatMessageReply from './ChatMessageReply.vue'
import { BaseCheckbox } from '@components/BaseCheckbox'
import { useChatMessage } from '../model/useChatMessage'
import ChatMessageReactions from './ChatMessageReactions.vue'
import { ChatBadges, CHAT_MAX_BADGES } from '../../ChatBadges'
import ChatMessageAttachments from './ChatMessageAttachments.vue'
import type { ChatMessageItemEmits, ChatMessageItemProps } from '../types/ChatMessageItem.types'

const props = withDefaults(defineProps<ChatMessageItemProps>(), {
	isGroup: false,
	isSelectionMode: false,
	isSelected: false,
	isContextActive: false,
	searchQuery: '',
	allImagesUrls: () => [],
	badges: () => [],
	maxBadges: CHAT_MAX_BADGES,
})

const emit = defineEmits<ChatMessageItemEmits>()

const {
	hasAvatar,
	showSenderName,
	senderName,
	avatarLabel,
	statusLabel,
	isFailed,
	gallery,
	handleSelect,
	handleAvatarClick,
	handleReplyAction,
	handleContextMenu,
	handleMoreClick,
	handleReplyClick,
	handleDownload,
	handleFileClick,
	handleMentionClick,
	handleCommandClick,
	handleReactionToggle,
	handleRetry,
	handleDiscard,
} = useChatMessage(props, emit)
</script>
