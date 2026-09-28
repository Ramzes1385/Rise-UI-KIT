<template>
	<BaseCard
		class="base-chat"
		:class="[variantClass, classes.root]"
		:style="[sizeScaleStyle, variantStyle, customColorStyle, { height: height }]"
		:size-scale="sizeScale"
		:padding="0">
		<div class="base-chat__body">
			<ChatHeader
				v-if="title"
				:title="title"
				:subtitle="subtitle"
				:avatar="avatar"
				:size-scale="sizeScale"
				:is-typing="isTyping"
				:typing-username="typingUsername"
				:is-searching="isSearching"
				v-model:search-query="searchQuery"
				@avatar-click="handleHeaderAvatarClick"
				@toggle-search="isSearching = !isSearching"
				@info-click="handleInfoClick" />

			<ChatPinnedPanel
				:pinned-messages="pinnedMessages"
				v-model:current-index="currentPinnedIndex"
				:current-user-role="currentUserRole"
				:size-scale="sizeScale"
				@click="handleScrollToPinned"
				@unpin="handleUnpin" />

			<ChatMessageList
				ref="messageListRef"
				:messages="filteredMessages"
				:size-scale="sizeScale"
				:search-query="searchQuery"
				:selected-message-ids="selectedMessageIds"
				:is-group="isGroup"
				:is-typing="isTyping"
				:typing-username="typingUsername"
				:avatar="avatar"
				:all-images-urls="allImagesUrls"
				:current-user-role="currentUserRole"
				@avatar-click="handleAvatarClick"
				@message-select="handleMessageSelect"
				@reply-click="handleReplyClick"
				@message-reply="handleMessageReply"
				@message-reaction="handleMessageReaction"
				@download-file="handleDownloadFile"
				@file-click="handleDownloadFile"
				@pin-message="handlePin"
				@delete-message="handleDeleteSingle"
				@mention-click="handleMentionClick"
				@command-click="handleCommandClick" />

			<ChatInput
				v-show="selectedMessageIds.length === 0"
				:size-scale="sizeScale"
				:replying-to="replyingTo"
				:quick-replies="quickReplies"
				:members="members"
				:commands="commands"
				:is-group="isGroup"
				@send="handleSend"
				@attach="handleAttach"
				@cancel-reply="handleCancelReply"
				@quick-reply="handleQuickReply" />

			<ChatSelectionToolbar
				v-if="selectedMessageIds.length > 0"
				:selected-count="selectedMessageIds.length"
				:size-scale="sizeScale"
				@forward="handleForwardSelected"
				@delete="handleDeleteSelected"
				@cancel="handleCancelSelection" />

			<BaseModal
				:is-open="deleteConfirm.isOpen"
				:is-contained="true"
				:size-scale="sizeScale"
				:title="UI_CHAT_TEXT.DELETE_CONFIRM"
				@update:is-open="handleCancelDelete">
				<p class="base-chat__confirm-text">{{ deleteConfirmText }}</p>
				<template #footer>
					<BaseButton variant="outline" :size-scale="sizeScale" @click="handleCancelDelete">
						{{ UI_TEXT.CANCEL }}
					</BaseButton>
					<BaseButton :size-scale="sizeScale" class="base-chat__confirm-delete-btn" @click="handleConfirmDelete">
						{{ UI_TEXT.DELETE }}
					</BaseButton>
				</template>
			</BaseModal>

			<ChatSlideover
				v-model:is-open="isInfoOpen"
				v-model:active-tab="activeTab"
				v-model:selected-member-id="selectedMemberId"
				:title="title"
				:subtitle="subtitle"
				:avatar="avatar"
				:description="description"
				:is-group="isGroup"
				:members="members"
				:messages="messages"
				:current-user-role="currentUserRole"
				:size-scale="sizeScale"
				@file-click="handleDownloadFile"
				@download-file="handleDownloadFile"
				@write-message="handleWriteMessage"
				@kick-member="handleKickMember"
				@ban-member="handleBanMember"
				@update-member-role="handleUpdateMemberRole" />
		</div>
	</BaseCard>
</template>

<script setup lang="ts">
import '../styles/BaseChat.style.scss'
import { ChatInput } from './ChatInput'
import { ChatHeader } from './ChatHeader'
import { ChatSlideover } from './ChatSlideover'
import { BaseCard } from '@components/BaseCard'
import { BaseModal } from '@components/BaseModal'
import { useBaseChat } from '../model/useBaseChat'
import { ChatMessageList } from './ChatMessageList'
import { ChatPinnedPanel } from './ChatPinnedPanel'
import { BaseButton } from '@components/BaseButton'
import { kitDefaults } from '@composables/useDefaults'
import { UI_CHAT_TEXT, UI_TEXT } from '@/locales/messages'
import { ChatSelectionToolbar } from './ChatSelectionToolbar'
import { SIZE_SCALE_DEFAULT } from '@composables/useBaseComponent'
import type { BaseChatEmits, BaseChatProps, BaseChatSlots } from '../types/BaseChat.types'

const props = withDefaults(
	defineProps<BaseChatProps>(),
	kitDefaults('BaseChat', {
		variant: 'bubble',
		height: '500px',
		sizeScale: SIZE_SCALE_DEFAULT,
		isTyping: false,
		typingUsername: '',
		isGroup: false,
		members: () => [],
		quickReplies: () => [],
		commands: () => [],
		currentUserRole: 'member',
	}),
)
const emit = defineEmits<BaseChatEmits>()

defineSlots<BaseChatSlots>()

const {
	variantClass,
	variantStyle,
	sizeScaleStyle,
	customColorStyle,
	classes,
	messageListRef,
	searchQuery,
	isSearching,
	selectedMessageIds,
	replyingTo,
	isInfoOpen,
	activeTab,
	selectedMemberId,
	pinnedMessages,
	currentPinnedIndex,
	filteredMessages,
	allImagesUrls,
	handleMessageSelect,
	handleMessageReply,
	handleCancelReply,
	handleAvatarClick,
	handleInfoClick,
	handleScrollToPinned,
	deleteConfirm,
	deleteConfirmText,
	handleDeleteSelected,
	handleDeleteSingle,
	handleConfirmDelete,
	handleCancelDelete,
	handleForwardSelected,
	handleCancelSelection,
	handleHeaderAvatarClick,
	handleReplyClick,
	handleSend,
	handleAttach,
	handleMessageReaction,
	handleQuickReply,
	handleDownloadFile,
	handlePin,
	handleUnpin,
	handleWriteMessage,
	handleKickMember,
	handleBanMember,
	handleUpdateMemberRole,
	handleMentionClick,
	handleCommandClick,
} = useBaseChat(props, emit)
</script>
