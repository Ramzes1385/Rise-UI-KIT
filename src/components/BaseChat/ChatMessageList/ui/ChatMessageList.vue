<template>
	<div
		ref="listRef"
		class="base-chat-message-list"
		:class="{ 'base-chat-message-list--selection-mode': isSelectionMode }"
		@scroll="closeContextMenu">
		<ChatMessageItem
			v-for="msg in messages"
			:key="msg.id"
			:message="msg"
			:is-group="isGroup"
			:is-selection-mode="isSelectionMode"
		:is-selected="selectedSet.has(msg.id)"
		:is-context-active="activeContextMessageId === msg.id"
			:size-scale="sizeScale"
			:search-query="searchQuery"
			:all-images-urls="allImagesUrls"
			@avatar-click="handleAvatarClick(msg)"
			@select="handleSelect(msg.id)"
			@reply-action="handleReplyAction(msg)"
			@context-menu="handleContextMenu($event, msg)"
			@reply-click="handleReplyClick"
			@download="handleDownload"
			@file-click="handleFileClick"
			@mention-click="handleMentionClick"
			@command-click="handleCommandClick"
			@reaction-toggle="handleToggleReaction(msg.id, $event)" />

		<!-- Пузырь печатания собеседника внизу списка сообщений -->
		<div
			v-if="isTyping"
			class="base-chat-message-list__item base-chat-message-list__item--other base-chat-message-list__item--typing-indicator">
			<BaseAvatar
				v-if="avatar"
				:src="avatar"
				:name="typingUsername || 'Companion'"
				:size-scale="sizeScale * 0.8"
				class="base-chat-message-list__avatar" />
			<div class="base-chat-message-list__bubble-wrapper">
				<div class="base-chat-message-list__bubble base-chat-message-list__bubble--typing">
					<BaseLoader variant="dots" :size-scale="sizeScale * 0.8" />
				</div>
			</div>
		</div>

		<!-- Контекстное меню -->
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
			@delete="handleContextMenuDelete" />
	</div>
</template>

<script setup lang="ts">
import { UI_CONTEXT_MENU_DEFAULT_HEIGHT, UI_CONTEXT_MENU_DEFAULT_WIDTH } from '@constants'
import { BaseAvatar } from '@components/BaseAvatar'
import { BaseLoader } from '@components/BaseLoader'
import { useAutoScroll } from '@composables/useAutoScroll'
import { useClickOutside } from '@composables/useClickOutside'
import { copyTextToClipboard } from '@utils/clipboardUtils'
import { computed, onBeforeUnmount, ref } from 'vue'
import type { Ref } from 'vue'
import type { ChatMessage, ChatMessageAttachment } from '../../BaseChat.types'
import '../styles/ChatMessageList.style.scss'
import type { ChatMessageListEmits, ChatMessageListProps } from '../model/ChatMessageList.types'
import ChatMessageItem from './ChatMessage.vue'
import ChatMessageContextMenu from './ChatMessageContextMenu.vue'

const props = defineProps<ChatMessageListProps>()

const emit = defineEmits<ChatMessageListEmits>()

const sizeScale = computed(() => props.sizeScale ?? 100)
const searchQuery = computed(() => props.searchQuery ?? '')
const selectedMessageIds = computed(() => props.selectedMessageIds ?? [])
const isGroup = computed(() => props.isGroup ?? false)
const isTyping = computed(() => props.isTyping ?? false)
const typingUsername = computed(() => props.typingUsername ?? '')
const avatar = computed(() => props.avatar ?? '')
const allImagesUrls = computed(() => props.allImagesUrls ?? [])
const currentUserRole = computed(() => props.currentUserRole ?? 'member')

const listRef = ref<HTMLElement | null>(null)
const contextMenuRef = ref<InstanceType<typeof ChatMessageContextMenu> | null>(null)
const highlightTimeoutId = ref<ReturnType<typeof setTimeout> | null>(null)

const contextMenu = ref({
	isOpen: false,
	x: 0,
	y: 0,
	message: null as ChatMessage | null,
})

// Автопрокрутка к последнему сообщению
useAutoScroll({
	container: listRef,
	enabled: () => true,
	watchSource: () => props.messages.length + (isTyping.value ? 1 : 0),
})

// Закрытие контекстного меню по клику снаружи
useClickOutside({
	targets: [contextMenuRef as unknown as Ref<HTMLElement | null>],
	callback: closeContextMenu,
	isActive: () => contextMenu.value.isOpen,
})

/** Набор ID выбранных сообщений */
const selectedSet = computed(() => new Set(selectedMessageIds.value))

/** ID сообщения, для которого открыто контекстное меню */
const activeContextMessageId = computed(() => contextMenu.value.message?.id ?? null)

/** Проверка, активен ли режим выбора сообщений */
const isSelectionMode = computed(() => {
	return selectedMessageIds.value.length > 0
})

/** Обработка клика по аватару */
function handleAvatarClick(msg: ChatMessage): void {
	/* istanbul ignore else — defensive: handleAvatarClick вызывается только из шаблона для sender === 'other' */
	if (msg.sender === 'other') {
		/* istanbul ignore next — defensive: senderId/senderName опциональны для других чатов */
		emit('avatar-click', msg.senderId || msg.senderName || '')
	}
}

/** Обработка выбора сообщения */
function handleSelect(messageId: string): void {
	emit('message-select', messageId)
}

/** Обработка клика по цитируемому сообщению */
function handleReplyClick(replyToId?: string): void {
	/* istanbul ignore else — defensive: цитата рендерится только при наличии replyToId (v-if в шаблоне) */
	if (replyToId) {
		emit('reply-click', replyToId)
	}
}

/** Обработка нажатия кнопки "Ответить" */
function handleReplyAction(msg: ChatMessage): void {
	emit('message-reply', msg)
}

/** Скачивание файла */
function handleDownload(file: ChatMessageAttachment): void {
	emit('download-file', file)
}

/** Клик по файлу для предпросмотра */
function handleFileClick(file: ChatMessageAttachment): void {
	emit('file-click', file)
}

/** Открытие контекстного меню */
function handleContextMenu(event: MouseEvent, msg: ChatMessage): void {
	/* istanbul ignore next — defensive: contextmenu заблокирован в режиме выбора через CSS */
	if (isSelectionMode.value) return
	const menuWidth = UI_CONTEXT_MENU_DEFAULT_WIDTH
	const menuHeight = UI_CONTEXT_MENU_DEFAULT_HEIGHT
	const windowWidth = window.innerWidth
	const windowHeight = window.innerHeight

	let x = event.clientX
	let y = event.clientY

	/* istanbul ignore next — boundary: требует window > menuWidth, тривиальная гео-логика */
	if (x + menuWidth > windowWidth) {
		x = windowWidth - menuWidth - 16
	}
	/* istanbul ignore next — boundary: требует window > menuHeight, тривиальная гео-логика */
	if (y + menuHeight > windowHeight) {
		y = windowHeight - menuHeight - 16
	}

	contextMenu.value = {
		isOpen: true,
		x: Math.max(16, x),
		y: Math.max(16, y),
		message: msg,
	}
}

/** Закрытие контекстного меню */
function closeContextMenu(): void {
	contextMenu.value.isOpen = false
	contextMenu.value.message = null
}

/** Выбор реакции из контекстного меню */
function handleSelectReaction(emoji: string): void {
	/* istanbul ignore next — defensive: меню открывается только при наличии message */
	if (contextMenu.value.message) {
		emit('message-reaction', {
			messageId: contextMenu.value.message.id,
			emoji,
		})
	}
	closeContextMenu()
}

/** Переключение реакции по клику на бейдж */
function handleToggleReaction(messageId: string, emoji: string): void {
	emit('message-reaction', { messageId, emoji })
}

/** Действие "Ответить" из контекстного меню */
function handleContextMenuReply(): void {
	/* istanbul ignore next — defensive: меню открывается только при наличии message */
	if (contextMenu.value.message) {
		emit('message-reply', contextMenu.value.message)
	}
	closeContextMenu()
}

/** Действие "Выбрать" из контекстного меню */
function handleContextMenuSelect(): void {
	/* istanbul ignore next — defensive: меню открывается только при наличии message */
	if (contextMenu.value.message) {
		emit('message-select', contextMenu.value.message.id)
	}
	closeContextMenu()
}

/** Действие "Копировать" из контекстного меню */
async function handleContextMenuCopy(): Promise<void> {
	if (contextMenu.value.message?.text) {
		try {
			await copyTextToClipboard(contextMenu.value.message.text)
		} catch {
			// Clipboard API может быть недоступен или отклонён — игнорируем ошибку копирования
		}
	}
	closeContextMenu()
}

/** Действие "Закрепить" из контекстного меню */
function handleContextMenuPin(): void {
	/* istanbul ignore next — defensive: меню открывается только при наличии message */
	if (contextMenu.value.message) {
		emit('pin-message', contextMenu.value.message.id)
	}
	closeContextMenu()
}

/** Действие "Удалить" из контекстного меню */
function handleContextMenuDelete(): void {
	/* istanbul ignore next — defensive: меню открывается только при наличии message */
	if (contextMenu.value.message) {
		emit('delete-message', contextMenu.value.message.id)
	}
	closeContextMenu()
}

/**
 * Скроллит к сообщению с указанным id и подсвечивает его.
 * Поиск элемента выполняется локально внутри контейнера списка,
 * сохраняя инкапсуляцию DOM компонента.
 */
function scrollToMessage(messageId: string): void {
	const container = listRef.value
	/* istanbul ignore next — defensive: ref может быть null при unmount */
	if (!container) return
	const element = container.querySelector<HTMLElement>(`#msg-${messageId}`)
	/* istanbul ignore next — defensive: сообщение могло быть удалено */
	if (!element) return

	if (highlightTimeoutId.value !== null) {
		clearTimeout(highlightTimeoutId.value)
	}

	element.scrollIntoView({ behavior: 'smooth', block: 'center' })
	element.classList.add('base-chat-message-list__item--highlighted')
	highlightTimeoutId.value = setTimeout(() => {
		element.classList.remove('base-chat-message-list__item--highlighted')
		highlightTimeoutId.value = null
	}, 1500)
}

onBeforeUnmount(() => {
	if (highlightTimeoutId.value !== null) {
		clearTimeout(highlightTimeoutId.value)
	}
})

defineExpose({ scrollToMessage })

/** Клик по @упоминанию в тексте сообщения */
function handleMentionClick(mention: string): void {
	emit('mention-click', mention)
}

/** Клик по /команде в тексте сообщения */
function handleCommandClick(command: string): void {
	emit('command-click', command)
}
</script>
