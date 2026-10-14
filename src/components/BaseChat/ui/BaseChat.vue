<template>
	<BaseCard
		:class="[ui('root'), variantClass, classes.root]"
		:style="[sizeScaleStyle, variantStyle, customColorStyle, { height: height }]"
		:size-scale="sizeScale"
		:padding="0">
		<div :class="ui('body')" @keydown.esc="handleSelectionEscape">
			<ChatHeader
				v-if="title"
				:class="ui('header')"
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
				:class="ui('pinned')"
				:pinned-messages="pinnedMessages"
				v-model:current-index="currentPinnedIndex"
				:current-user-role="currentUserRole"
				:size-scale="sizeScale"
				@click="handleScrollToPinned"
				@unpin="handleUnpin" />

			<ChatMessageList
				:key="chatId"
				ref="messageListRef"
				:class="ui('list')"
				:message-class="ui('message')"
				:bubble-class="ui('bubble')"
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
				:members="members"
				:max-badges="maxBadges"
				:last-read-message-id="lastReadMessageId"
				:today="today"
				:is-loading="isLoading"
				:has-more-messages="hasMoreMessages"
				:is-loading-more="isLoadingMore"
				@avatar-click="handleAvatarClick"
				@message-select="handleMessageSelect"
				@reply-click="handleReplyClick"
				@message-reply="handleMessageReply"
				@message-reaction="handleMessageReaction"
				@download-file="handleDownloadFile"
				@file-click="handleDownloadFile"
				@message-edit="handleMessageEdit"
				@load-more="$emit('load-more')"
				@pin-message="handlePin"
				@unpin-message="handleUnpin"
				@delete-message="handleDeleteSingle"
				@mention-click="handleMentionClick"
				@command-click="handleCommandClick"
				@retry-message="emit('retry-message', $event)"
				@discard-message="emit('discard-message', $event)" />

			<ChatInput
				:key="chatId"
				v-show="selectedMessageIds.length === 0"
				:class="ui('input')"
				:size-scale="sizeScale"
				:replying-to="replyingTo"
				:editing-message="editingMessage"
				:quick-replies="quickReplies"
				:members="members"
				:commands="commands"
				:is-group="isGroup"
				:accept="accept"
				:max-file-size="maxFileSize"
				:max-files="maxFiles"
				:has-voice="hasVoiceMessages"
				:request-voice-stream="requestVoiceStream"
				@send="handleSend"
				@send-voice="handleSendVoice"
				@attach="handleAttach"
				@attach-error="handleAttachError"
				@edit="handleEdit"
				@cancel-edit="handleCancelEdit"
				@edit-last="handleEditLast"
				@cancel-reply="handleCancelReply"
				@quick-reply="handleQuickReply" />

			<ChatSelectionToolbar
				v-if="selectedMessageIds.length > 0"
				:class="ui('toolbar')"
				:selected-count="selectedMessageIds.length"
				:total-count="filteredMessages.length"
				:visible-selected-count="visibleSelectedCount"
				:size-scale="sizeScale"
				@select-all="handleSelectAll"
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

			<BaseModal
				:is-open="memberConfirm.isOpen"
				:is-contained="true"
				:size-scale="sizeScale"
				:title="memberConfirmTitle"
				@update:is-open="handleCancelMember">
				<p class="base-chat__confirm-text">{{ memberConfirmText }}</p>
				<template #footer>
					<BaseButton variant="outline" :size-scale="sizeScale" @click="handleCancelMember">
						{{ UI_TEXT.CANCEL }}
					</BaseButton>
					<BaseButton :size-scale="sizeScale" class="base-chat__confirm-delete-btn" @click="handleConfirmMember">
						{{ UI_TEXT.CONFIRM }}
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
				:max-badges="maxBadges"
				:current-user-id="currentUserId"
				:max-warnings="maxWarnings"
				:companion-status="companionStatus"
				:size-scale="sizeScale"
				@add-member="handleAddMember"
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
import { CHAT_MAX_BADGES } from './ChatBadges'
import { ChatSlideover } from './ChatSlideover'
import { BaseCard } from '@components/BaseCard'
import { BaseModal } from '@components/BaseModal'
import { useBaseChat } from '../model/useBaseChat'
import { ChatMessageList } from './ChatMessageList'
import { ChatPinnedPanel } from './ChatPinnedPanel'
import { BaseButton } from '@components/BaseButton'
import { CHAT_MAX_WARNINGS } from '../model/chatLimits'
import { UI_CHAT_TEXT, UI_TEXT } from '@/locales/messages'
import { kitDefaults } from '@composables/base/useDefaults'
import { ChatSelectionToolbar } from './ChatSelectionToolbar'
import { SIZE_SCALE_DEFAULT } from '@composables/base/useBaseComponent'
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
		maxBadges: CHAT_MAX_BADGES,
		maxWarnings: CHAT_MAX_WARNINGS,
		isLoading: false,
		hasMoreMessages: false,
		isLoadingMore: false,
		autoDownload: true,
	}),
)
const emit = defineEmits<BaseChatEmits>()

defineSlots<BaseChatSlots>()

const {
	ui,
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
	visibleSelectedCount,
	allImagesUrls,
	handleMessageSelect,
	handleSelectAll,
	handleSelectionEscape,
	handleEditLast,
	handleMessageReply,
	handleCancelReply,
	editingMessage,
	handleMessageEdit,
	handleCancelEdit,
	handleEdit,
	handleAddMember,
	memberConfirm,
	memberConfirmTitle,
	memberConfirmText,
	handleConfirmMember,
	handleCancelMember,
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
	handleSendVoice,
	handleAttach,
	handleAttachError,
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
