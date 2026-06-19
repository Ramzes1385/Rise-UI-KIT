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

			<!-- Панель закрепленных сообщений (несколько закрепов) -->
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

			<!-- Панель ввода или тулбар массовых действий -->
			<ChatInput
				v-if="selectedMessageIds.length === 0"
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
				v-else
				:selected-count="selectedMessageIds.length"
				:size-scale="sizeScale"
				@forward="handleForwardSelected"
				@delete="handleDeleteSelected"
				@cancel="handleCancelSelection" />

			<!-- Окно подтверждения удаления сообщений -->
			<BaseModal
				:is-open="deleteConfirm.isOpen"
				:is-contained="true"
				:size-scale="sizeScale"
				:title="UI_CHAT_TEXT.DELETE_CONFIRM"
				@update:is-open="handleCancelDelete">
				<BaseText :size-scale="sizeScale * UI_CHAT_SCALE.CONFIRM" class="base-chat__confirm-text">
					{{ deleteConfirmText }}
				</BaseText>
				<template #footer>
					<div class="base-chat__confirm-actions">
						<BaseButton variant="ghost" :size-scale="sizeScale" @click="handleCancelDelete">
							{{ UI_TEXT.CANCEL }}
						</BaseButton>
						<BaseButton
							variant="default"
							:size-scale="sizeScale"
							class="base-chat__confirm-delete-btn"
							@click="handleConfirmDelete">
							{{ UI_TEXT.DELETE }}
						</BaseButton>
					</div>
				</template>
			</BaseModal>

			<!-- Слайдовер информации, медиа, файлов и админ-панели -->
			<ChatSlideover
				v-model:is-open="isInfoOpen"
				v-model:active-tab="activeTab"
				v-model:selected-member-id="selectedMemberId"
				:title="title"
				:subtitle="subtitle"
				:avatar="avatar"
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
import { ref } from 'vue'
import { BaseButton } from '@components/BaseButton'
import { BaseCard } from '@components/BaseCard'
import { BaseModal } from '@components/BaseModal'
import { BaseText } from '@components/BaseText'
import { useStandardBaseComponent } from '@composables/useBaseComponent'
import { useChatActions } from '@composables/useChatActions'
import { useChatDeleteConfirm } from '@composables/useChatDeleteConfirm'
import { useChatState } from '@composables/useChatState'
import { UI_TEXT, UI_SIZE, UI_CHAT_SCALE, UI_CHAT_TEXT, SIZE_SCALE_DEFAULT} from '@constants'
import '../styles/BaseChat.style.scss'
import { ChatHeader } from './ChatHeader'
import { ChatInput } from './ChatInput'
import { ChatMessageList } from './ChatMessageList'
import { ChatPinnedPanel } from './ChatPinnedPanel'
import { ChatSelectionToolbar } from './ChatSelectionToolbar'
import { ChatSlideover } from './ChatSlideover'
import type { BaseChatEmits, BaseChatProps, BaseChatSlots } from '../model/BaseChat.types'

/** Публичные методы ChatMessageList, экспонированные через defineExpose */
interface MessageListExposed {
	scrollToMessage: (messageId: string) => void
}

const props = withDefaults(defineProps<BaseChatProps>(), {
	variant: 'bubble',
	height: UI_SIZE.CHAT_DEFAULT_HEIGHT,
	sizeScale: SIZE_SCALE_DEFAULT,
	isTyping: false,
	typingUsername: '',
	isGroup: false,
	members: () => [],
	quickReplies: () => [],
	commands: () => [],
	currentUserRole: 'member',
})

const emit = defineEmits<BaseChatEmits>()

defineSlots<BaseChatSlots>()

const { variantClass, variantStyle, sizeScaleStyle, customColorStyle, classes } = useStandardBaseComponent('base-chat', props, ['root'])

const messageListRef = ref<MessageListExposed | null>(null)

const {
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
} = useChatState(props, emit, {
	scrollToMessage: messageId => messageListRef.value?.scrollToMessage(messageId),
})

const {
	deleteConfirm,
	deleteConfirmText,
	handleDeleteSelected,
	handleDeleteSingle,
	handleConfirmDelete,
	handleCancelDelete,
	handleForwardSelected,
	handleCancelSelection,
} = useChatDeleteConfirm({
	selectedMessageIds,
	onDelete: ids => emit('delete-messages', ids),
	onForward: ids => emit('forward-messages', ids),
})

const {
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
} = useChatActions({
	emit,
	replyingTo,
	getAvatar: () => props.avatar,
	messageListRef,
	handleAvatarClick,
	handleCancelReply,
})
</script>
