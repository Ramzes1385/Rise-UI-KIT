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
				:title="UI_CHAT_DELETE_CONFIRM"
				@update:is-open="handleCancelDelete">
				<BaseText :size-scale="sizeScale * UI_CHAT_SCALE_CONFIRM" class="base-chat__confirm-text">
					{{ deleteConfirmText }}
				</BaseText>
				<template #footer>
					<div class="base-chat__confirm-actions">
						<BaseButton variant="ghost" :size-scale="sizeScale" @click="handleCancelDelete">
							{{ UI_CANCEL_TEXT }}
						</BaseButton>
						<BaseButton
							variant="default"
							:size-scale="sizeScale"
							class="base-chat__confirm-delete-btn"
							@click="handleConfirmDelete">
							{{ UI_DELETE_TEXT }}
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
import { BaseButton } from '@components/BaseButton'
import { BaseCard } from '@components/BaseCard'
import { BaseModal } from '@components/BaseModal'
import { BaseText } from '@components/BaseText'
import { UI_CANCEL_TEXT, UI_CHAT_DEFAULT_HEIGHT, UI_CHAT_DELETE_CONFIRM, UI_CHAT_SCALE_CONFIRM, UI_DELETE_TEXT, SIZE_SCALE_DEFAULT} from '@constants'
import { useStandardBaseComponent } from '@composables/useBaseComponent'
import { downloadFile } from '@utils/fileUtils'
import { ref } from 'vue'
import '../styles/BaseChat.style.scss'
import type { BaseChatEmits, BaseChatProps, ChatMessageAttachment } from '../model/BaseChat.types'

import { ChatHeader } from '../ChatHeader'
import { ChatInput } from '../ChatInput'
import { ChatMessageList } from '../ChatMessageList'
import { useChatDeleteConfirm } from '../composables/useChatDeleteConfirm'
import { useChatState } from '../composables/useChatState'
import { ChatPinnedPanel } from './ChatPinnedPanel'
import { ChatSelectionToolbar } from './ChatSelectionToolbar'
import { ChatSlideover } from './ChatSlideover'

/** Публичные методы ChatMessageList, экспонированные через defineExpose */
interface MessageListExposed {
	scrollToMessage: (messageId: string) => void
}

const props = withDefaults(defineProps<BaseChatProps>(), {
	variant: 'bubble',
	height: UI_CHAT_DEFAULT_HEIGHT,
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

const { variantClass, variantStyle, sizeScaleStyle, customColorStyle, classes } = useStandardBaseComponent('base-chat', props, ['root'])

const messageListRef = ref<MessageListExposed | null>(null)

// Подключаем локальное состояние чата
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

// Логика подтверждения удаления
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

/**
 * Клик по аватару в шапке чата.
 * Аватар в ChatHeader рендерится только при наличии avatar (v-if), поэтому
 * на практике сюда всегда приходит непустая строка; ветка `|| ''` — защитная.
 */
function handleHeaderAvatarClick(): void {
	/* istanbul ignore next — defensive: ChatHeader рендерит аватар (и эмитит avatar-click) только при truthy avatar */
	handleAvatarClick(props.avatar || '')
}

/** Обработка клика по цитируемому сообщению — делегируем скролл компоненту-владельцу списка */
function handleReplyClick(replyToId: string): void {
	messageListRef.value?.scrollToMessage(replyToId)
}

/** Обработка отправки сообщения */
function handleSend(payload: { text: string; attachments?: ChatMessageAttachment[] }): void {
	emit('send', {
		...payload,
		replyToId: replyingTo.value?.id || undefined,
	})
	handleCancelReply()
}

/** Обработка прикрепления файлов */
function handleAttach(files: FileList): void {
	emit('attach', files)
}

/** Обработка реакции на сообщение */
function handleMessageReaction(payload: { messageId: string; emoji: string }): void {
	emit('message-reaction', payload)
}

/** Обработка быстрого ответа */
function handleQuickReply(text: string): void {
	emit('quick-reply', text)
}

/** Обработка скачивания файла */
function handleDownloadFile(file: ChatMessageAttachment): void {
	try {
		downloadFile(file.url, file.name)
		emit('download-file', file)
	} catch (e) {
		/* istanbul ignore next — defensive: создание DOM-элемента не бросает в стандартной среде */
		emit('error', { type: 'download', message: `[BaseChat] Download failed: ${file.name}`, detail: e })
	}
}

/** Закрепить сообщение */
function handlePin(messageId: string): void {
	emit('pin-message', messageId)
}

/** Открепить сообщение */
function handleUnpin(messageId: string): void {
	emit('unpin-message', messageId)
}

/** Написать сообщение пользователю (переход в личку) */
function handleWriteMessage(memberId: string): void {
	emit('avatar-click', memberId)
}

/** Исключить участника */
function handleKickMember(memberId: string): void {
	emit('kick-member', memberId)
}

/** Забанить участника */
function handleBanMember(payload: { memberId: string; reason?: string; warningsCount?: number }): void {
	emit('ban-member', payload)
}

/** Изменить роль участника */
function handleUpdateMemberRole(payload: { memberId: string; role: string }): void {
	emit('update-member-role', payload)
}

/** Клик по @упоминанию в тексте сообщения */
function handleMentionClick(mention: string): void {
	emit('mention-click', mention)
}

/** Клик по /команде в тексте сообщения */
function handleCommandClick(command: string): void {
	emit('command-click', command)
}
</script>
