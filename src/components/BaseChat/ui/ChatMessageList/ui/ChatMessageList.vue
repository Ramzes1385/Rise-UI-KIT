<template>
	<div
		ref="listRef"
		class="base-chat-message-list"
		:class="{ 'base-chat-message-list--selection-mode': isSelectionMode }"
		role="log"
		:aria-label="UI_CHAT_TEXT.MESSAGES_ARIA"
		@scroll="handleListScroll">
		<!-- role="log": скринридер вежливо (aria-live="polite") зачитывает новые сообщения -->
		<ChatMessageItem
			v-for="message in messages"
			:key="message.id"
			:message="message"
			:is-group="isGroup"
			:is-selection-mode="isSelectionMode"
			:is-selected="selectedSet.has(message.id)"
			:is-context-active="activeContextMessageId === message.id"
			:size-scale="sizeScale"
			:search-query="searchQuery"
			:all-images-urls="allImagesUrls"
			@avatar-click="handleAvatarClick(message)"
			@select="handleSelect(message.id)"
			@reply-action="handleReplyAction(message)"
			@context-menu="handleContextMenu($event, message)"
			@reply-click="handleReplyClick"
			@download="handleDownload"
			@file-click="handleFileClick"
			@mention-click="handleMentionClick"
			@command-click="handleCommandClick"
			@reaction-toggle="handleToggleReaction(message.id, $event)" />

		<!-- Пусто: в ленте ещё нет сообщений или поиск ничего не нашёл -->
		<BaseEmpty
			v-if="messages.length === 0 && !isTyping"
			variant="ghost"
			:icon="searchQuery ? 'search' : 'inbox'"
			:title="searchQuery ? UI_CHAT_TEXT.SEARCH_EMPTY_TITLE : UI_CHAT_TEXT.EMPTY_TITLE"
			:description="searchQuery ? UI_CHAT_TEXT.SEARCH_EMPTY_DESCRIPTION : UI_CHAT_TEXT.EMPTY_DESCRIPTION"
			:size-scale="sizeScale"
			class="base-chat-message-list__empty" />

		<div
			v-if="isTyping"
			class="base-chat-message-list__item base-chat-message-list__item--other base-chat-message-list__item--typing-indicator">
			<BaseAvatar
				v-if="avatar"
				:src="avatar"
				:name="typingUsername || 'Companion'"
				:size-scale="sizeScale"
				class="base-chat-message-list__avatar" />
			<div class="base-chat-message-list__bubble-wrapper">
				<div class="base-chat-message-list__bubble base-chat-message-list__bubble--typing">
					<BaseLoader variant="dots" :label="typingLabel" :size-scale="sizeScale * CHAT_SCALE.SMALL" />
				</div>
			</div>
		</div>

		<ChatMessageContextMenu
			ref="contextMenuRef"
			:is-open="contextMenu.isOpen"
			:x="contextMenu.x"
			:y="contextMenu.y"
			:message="contextMenu.message"
			:current-user-role="currentUserRole"
			:size-scale="sizeScale"
			@reaction="handleSelectReaction"
			@reply="handleContextMenuReply"
			@select="handleContextMenuSelect"
			@copy="handleContextMenuCopy"
			@pin="handleContextMenuPin"
			@delete="handleContextMenuDelete"
			@close="closeContextMenu" />
	</div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { UI_CHAT_TEXT } from '@/locales/messages'
import { BaseAvatar } from '@components/BaseAvatar'
import { BaseEmpty } from '@components/BaseEmpty'
import { BaseLoader } from '@components/BaseLoader'
import { useAutoScroll } from '@composables/useAutoScroll'
import { SIZE_SCALE_DEFAULT } from '@composables/useBaseComponent'
import { useChatMessageActions } from '@composables/useChatMessageActions'
import { CHAT_SCALE } from '../../../model/chatScale'
import ChatMessageItem from './ChatMessage.vue'
import ChatMessageContextMenu from './ChatMessageContextMenu.vue'
import '../styles/ChatMessageList.style.scss'
import type { ChatMessageListEmits, ChatMessageListProps } from '../model/ChatMessageList.types'

const props = withDefaults(defineProps<ChatMessageListProps>(), {
	sizeScale: SIZE_SCALE_DEFAULT,
	searchQuery: '',
	selectedMessageIds: () => [],
	isGroup: false,
	isTyping: false,
	typingUsername: '',
	avatar: '',
	allImagesUrls: () => [],
	currentUserRole: 'member',
})

const emit = defineEmits<ChatMessageListEmits>()

const {
	listRef,
	contextMenuRef,
	contextMenu,
	handleAvatarClick,
	handleSelect,
	handleReplyClick,
	handleReplyAction,
	handleDownload,
	handleFileClick,
	handleContextMenu,
	closeContextMenu,
	handleListScroll,
	handleSelectReaction,
	handleToggleReaction,
	handleContextMenuReply,
	handleContextMenuSelect,
	handleContextMenuCopy,
	handleContextMenuPin,
	handleContextMenuDelete,
	scrollToMessage,
	handleMentionClick,
	handleCommandClick,
} = useChatMessageActions({
	selectedMessageIds: computed(() => props.selectedMessageIds),
	emit,
})

useAutoScroll({
	container: listRef,
	enabled: () => true,
	watchSource: () => props.messages.length + (props.isTyping ? 1 : 0),
})

const selectedSet = computed(() => new Set(props.selectedMessageIds))
const activeContextMessageId = computed(() => contextMenu.value.message?.id ?? null)
const isSelectionMode = computed(() => props.selectedMessageIds.length > 0)
/** Доступное имя индикатора набора: «Анна печатает» или «Печатает» */
const typingLabel = computed(() =>
	props.typingUsername ? `${props.typingUsername} ${UI_CHAT_TEXT.TYPING_SUFFIX}` : UI_CHAT_TEXT.TYPING_LABEL,
)

defineExpose({ scrollToMessage })
</script>
