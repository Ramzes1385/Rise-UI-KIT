<template>
	<div
		ref="listRef"
		class="base-chat-message-list"
		:class="{ 'base-chat-message-list--selection-mode': isSelectionMode }"
		role="log"
		:aria-label="UI_CHAT_TEXT.MESSAGES_ARIA"
		@scroll="handleListScroll">
		<div class="base-chat-message-list__announcer" role="status">{{ failedAnnouncement }}</div>

		<div v-if="isLoadingMore" class="base-chat-message-list__loading-more">
			<BaseLoader variant="spinner" :label="UI_CHAT_TEXT.LOADING_MORE" :size-scale="sizeScale * CHAT_SCALE.SPINNER" />
		</div>

		<div v-if="isLoading" class="base-chat-message-list__skeleton" role="status" :aria-label="UI_CHAT_TEXT.LOADING_MESSAGES">
			<div
				v-for="row in CHAT_SKELETON_ROWS"
				:key="row.id"
				class="base-chat-message-list__skeleton-row"
				:class="`base-chat-message-list__skeleton-row--${row.side}`">
				<BaseSkeleton v-if="row.side === 'other'" shape="circle" :width="32" :size-scale="sizeScale" />
				<BaseSkeleton shape="rect" :width="row.width" :height="row.height" :size-scale="sizeScale" />
			</div>
		</div>

		<TransitionGroup v-else :name="enterName" @before-leave="handleBeforeLeave">
			<template v-for="item in timeline" :key="item.key">
				<ChatMessageItem
					v-if="item.type === 'message'"
					:class="messageClass"
					:bubble-class="bubbleClass"
					:message="item.message"
					:is-group="isGroup"
					:is-selection-mode="isSelectionMode"
					:is-selected="selectedSet.has(item.message.id)"
					:is-context-active="activeContextMessageId === item.message.id"
					:size-scale="sizeScale"
					:search-query="searchQuery"
					:all-images-urls="allImagesUrls"
					:badges="senderBadges(item.message)"
					:max-badges="maxBadges"
					@avatar-click="handleAvatarClick(item.message)"
					@select="handleSelect(item.message.id)"
					@retry="handleRetry(item.message.id, $event)"
					@discard="handleDiscard(item.message.id, $event)"
					@reply-action="handleReplyAction(item.message)"
					@context-menu="handleContextMenu($event, item.message)"
					@reply-click="handleReplyClick"
					@download="handleDownload"
					@file-click="handleFileClick"
					@mention-click="handleMentionClick"
					@command-click="handleCommandClick"
					@reaction-toggle="handleToggleReaction(item.message.id, $event)" />
				<div
					v-else
					class="base-chat-message-list__divider"
					:class="`base-chat-message-list__divider--${item.type}`"
					role="separator"
					:aria-label="item.label"
					:data-chat-unread="item.type === 'unread' ? '' : undefined">
					<span class="base-chat-message-list__divider-label" aria-hidden="true">{{ item.label }}</span>
				</div>
			</template>
		</TransitionGroup>

		<BaseEmpty
			v-if="messages.length === 0 && !isTyping && !isLoading"
			variant="ghost"
			is-compact
			:icon="isSearchActive ? 'search' : 'inbox'"
			:title="isSearchActive ? UI_CHAT_TEXT.SEARCH_EMPTY_TITLE : UI_CHAT_TEXT.EMPTY_TITLE"
			:description="isSearchActive ? UI_CHAT_TEXT.SEARCH_EMPTY_DESCRIPTION : UI_CHAT_TEXT.EMPTY_DESCRIPTION"
			:size-scale="sizeScale"
			class="base-chat-message-list__empty" />

		<div
			v-if="isTyping"
			class="base-chat-message-list__item base-chat-message-list__item--other base-chat-message-list__item--typing-indicator"
			:class="messageClass">
			<BaseAvatar
				v-if="avatar"
				:src="avatar"
				:name="typingUsername || 'Companion'"
				:size-scale="sizeScale"
				class="base-chat-message-list__avatar" />
			<div class="base-chat-message-list__bubble-wrapper">
				<div class="base-chat-message-list__bubble base-chat-message-list__bubble--typing" :class="bubbleClass">
					<BaseLoader variant="dots" :label="typingLabel" :size-scale="sizeScale * CHAT_SCALE.SMALL" />
				</div>
			</div>
		</div>

		<div v-if="hasNewBelow" class="base-chat-message-list__jump">
			<BaseButton variant="soft" :size-scale="sizeScale" @click="handleJumpToNew">
				<BaseIcon name="arrow-down" :size-scale="sizeScale * CHAT_SCALE.SMALL" />
				{{ UI_CHAT_TEXT.NEW_MESSAGES }}
			</BaseButton>
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
			@edit="handleContextMenuEdit"
			@pin="handleContextMenuPin"
			@delete="handleContextMenuDelete"
			@close="closeContextMenu" />
	</div>
</template>

<script setup lang="ts">
import '@components/BaseAvatar/styles/BaseAvatar.style.scss'
import '../styles/ChatMessageList.style.scss'
import ChatMessageItem from './ChatMessage.vue'
import { BaseIcon } from '@components/BaseIcon'
import { UI_CHAT_TEXT } from '@/locales/messages'
import { BaseEmpty } from '@components/BaseEmpty'
import { CHAT_MAX_BADGES } from '../../ChatBadges'
import { BaseAvatar } from '@components/BaseAvatar'
import { BaseButton } from '@components/BaseButton'
import { BaseLoader } from '@components/BaseLoader'
import { CHAT_SCALE } from '../../../model/chatScale'
import { BaseSkeleton } from '@components/BaseSkeleton'
import { CHAT_SKELETON_ROWS } from '../../../model/chatSkeleton'
import { useChatMessageList } from '../model/useChatMessageList'
import ChatMessageContextMenu from './ChatMessageContextMenu.vue'
import { SIZE_SCALE_DEFAULT } from '@composables/base/useBaseComponent'
import type { ChatMessageListEmits, ChatMessageListProps } from '../types/ChatMessageList.types'

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
	members: () => [],
	maxBadges: CHAT_MAX_BADGES,
	lastReadMessageId: undefined,
	today: undefined,
	isLoading: false,
	hasMoreMessages: false,
	isLoadingMore: false,
})

const emit = defineEmits<ChatMessageListEmits>()

const {
	isSearchActive,
	listRef,
	contextMenuRef,
	contextMenu,
	handleAvatarClick,
	handleSelect,
	handleRetry,
	handleDiscard,
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
	handleContextMenuEdit,
	handleContextMenuPin,
	handleContextMenuDelete,
	handleMentionClick,
	handleCommandClick,
	enterName,
	handleBeforeLeave,
	selectedSet,
	activeContextMessageId,
	isSelectionMode,
	typingLabel,
	senderBadges,
	timeline,
	hasNewBelow,
	handleJumpToNew,
	failedAnnouncement,
	exposed,
} = useChatMessageList(props, emit)

defineExpose(exposed)
</script>
