<template>
	<div
		ref="listRef"
		class="base-chat-message-list"
		:class="{ 'base-chat-message-list--selection-mode': isSelectionMode }"
		@scroll="closeContextMenu">
		<div
			v-for="msg in messages"
			:key="msg.id"
			:id="`msg-${msg.id}`"
			class="base-chat-message-list__item"
			:class="[
				`base-chat-message-list__item--${msg.sender}`,
				{
					'base-chat-message-list__item--has-avatar': msg.senderAvatar,
					'base-chat-message-list__item--selected': isSelected(msg.id),
					'base-chat-message-list__item--context-active': isContextActive(msg.id),
					'base-chat-message-list__item--has-reactions': msg.reactions && msg.reactions.length > 0,
				},
			]"
			@click="isSelectionMode ? handleSelect(msg.id) : undefined">
			<!-- Чекбокс для выделения -->
			<div v-if="isSelectionMode" class="base-chat-message-list__checkbox-wrapper" @click.stop>
				<BaseCheckbox
					:model-value="isSelected(msg.id)"
					:size-scale="sizeScale * 0.8"
					@update:model-value="handleSelect(msg.id)" />
			</div>

			<BaseAvatar
				v-if="msg.sender === 'other' && msg.senderAvatar"
				:src="msg.senderAvatar"
				:name="msg.senderName || 'Companion'"
				:size-scale="sizeScale * 0.8"
				class="base-chat-message-list__avatar"
				@click.stop="handleAvatarClick(msg)" />

			<div class="base-chat-message-list__bubble-wrapper">
				<div class="base-chat-message-list__bubble" @contextmenu.prevent="handleContextMenu($event, msg)">
					<!-- Кнопки действий при наведении -->
					<div v-if="!isSelectionMode" class="base-chat-message-list__actions">
						<BaseButton
							variant="ghost"
							:padding="1"
							:size-scale="sizeScale * 0.75"
							class="base-chat-message-list__action-btn"
							aria-label="Ответить на сообщение"
							@click.stop="handleReplyAction(msg)">
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
							@click.stop="handleSelect(msg.id)">
							<template #left>
								<BaseIcon name="check" :size-scale="sizeScale * 0.7" />
							</template>
						</BaseButton>
					</div>

					<BaseText
						v-if="isGroup && msg.sender === 'other' && msg.senderName"
						tag="span"
						:weight="600"
						:size-scale="sizeScale * 0.8"
						class="base-chat-message-list__sender-name"
						@click.stop="handleAvatarClick(msg)">
						{{ msg.senderName }}
					</BaseText>

					<!-- Цитата (ответ на сообщение) -->
					<div
						v-if="msg.replyToId"
						class="base-chat-message-list__reply-quote"
						@click.stop="handleReplyClick(msg.replyToId)">
						<BaseText
							tag="span"
							:weight="600"
							:size-scale="sizeScale * 0.75"
							class="base-chat-message-list__reply-sender">
							{{ msg.replyToSenderName || 'Сообщение' }}
						</BaseText>
						<BaseText tag="p" :size-scale="sizeScale * 0.75" class="base-chat-message-list__reply-text">
							{{ msg.replyToText }}
						</BaseText>
					</div>

					<!-- Вложения (медиа/файлы) -->
					<div v-if="msg.attachments && msg.attachments.length > 0" class="base-chat-message-list__attachments">
						<!-- Коллаж изображений -->
						<div
							v-if="getImages(msg).length > 0"
							class="base-chat-message-list__collage"
							:class="`base-chat-message-list__collage--count-${Math.min(getImages(msg).length, 4)}`">
							<div
								v-for="(img, idx) in getImages(msg).slice(0, 4)"
								:key="img.id"
								class="base-chat-message-list__collage-item">
								<BaseImage
									:src="img.url"
									:alt="img.name"
									:gallery="allImagesUrls && allImagesUrls.length > 0 ? allImagesUrls : getMessageImagesUrls(msg)"
									:has-zoom="true"
									class="base-chat-message-list__attached-image" />
								<BaseButton
									variant="ghost"
									:padding="1"
									:size-scale="sizeScale * 0.75"
									class="base-chat-message-list__download-btn"
									:aria-label="`Скачать изображение ${img.name}`"
									@click.stop="handleDownload(img)">
									<template #left>
										<BaseIcon name="download" :size-scale="sizeScale * 0.7" />
									</template>
								</BaseButton>
								<div v-if="idx === 3 && getImages(msg).length > 4" class="base-chat-message-list__collage-overlay">
									<BaseText
										:weight="600"
										:size-scale="sizeScale * 1.2"
										class="base-chat-message-list__collage-overlay-text">
										+{{ getImages(msg).length - 3 }}
									</BaseText>
								</div>
							</div>
						</div>

						<!-- Список файлов -->
						<div v-if="getFiles(msg).length > 0" class="base-chat-message-list__files-list">
							<div
								v-for="file in getFiles(msg)"
								:key="file.id"
								class="base-chat-message-list__attached-file"
								@click.stop="handleFileClick(file)">
								<BaseIcon
									:name="getFileIconName(file.name)"
									:size-scale="sizeScale * 0.9"
									class="base-chat-message-list__file-icon" />
								<div class="base-chat-message-list__attached-file-info">
									<BaseText
										tag="span"
										:size-scale="sizeScale * 0.85"
										:weight="600"
										class="base-chat-message-list__attached-file-name">
										{{ file.name }}
									</BaseText>
									<BaseText
										v-if="file.size"
										tag="span"
										:size-scale="sizeScale * 0.75"
										class="base-chat-message-list__attached-file-size">
										{{ file.size }}
									</BaseText>
								</div>
								<BaseButton
									variant="ghost"
									:padding="1"
									:size-scale="sizeScale * 0.75"
									class="base-chat-message-list__download-btn"
									:aria-label="`Скачать файл ${file.name}`"
									@click.stop="handleDownload(file)">
									<template #left>
										<BaseIcon name="download" :size-scale="sizeScale * 0.7" />
									</template>
								</BaseButton>
							</div>
						</div>
					</div>

					<!-- Текст сообщения: ссылки, @упоминания, /команды + подсветка поиска -->
					<BaseText v-if="msg.text" tag="p" :size-scale="sizeScale" class="base-chat-message-list__text">
						<span v-for="(token, index) in parseMessageText(msg.text)" :key="index">
							<a
								v-if="token.type === 'link'"
								:href="token.value"
								target="_blank"
								rel="noopener noreferrer"
								class="base-chat-message-list__link"
								@click.stop>
								{{ token.value }}
							</a>
							<button
								v-else-if="token.type === 'mention'"
								type="button"
								class="base-chat-message-list__mention"
								@click.stop="handleMentionClick(token.value)">
								{{ token.value }}
							</button>
							<button
								v-else-if="token.type === 'command'"
								type="button"
								class="base-chat-message-list__command"
								@click.stop="handleCommandClick(token.value)">
								{{ token.value }}
							</button>
							<template v-else>
								<span
									v-for="(part, partIndex) in getHighlightedParts(token.value)"
									:key="partIndex"
									:class="{ 'base-chat-message-list__highlight': part.isMatch }">
									{{ part.text }}
								</span>
							</template>
						</span>
					</BaseText>

					<!-- Реакции на сообщение -->
					<div
						v-if="msg.reactions && msg.reactions.length > 0"
						class="base-chat-message-list__reactions-display"
						:class="`base-chat-message-list__reactions-display--${msg.sender}`">
						<div
							v-for="reaction in msg.reactions"
							:key="reaction.emoji"
							class="base-chat-message-list__reaction-badge"
							:class="{ 'base-chat-message-list__reaction-badge--active': reaction.users.includes('me') }"
							@click.stop="handleToggleReaction(msg.id, reaction.emoji)">
							<span class="base-chat-message-list__reaction-emoji">{{ reaction.emoji }}</span>
							<span class="base-chat-message-list__reaction-count">{{ reaction.users.length }}</span>
						</div>
					</div>

					<div class="base-chat-message-list__meta">
						<BaseIcon
							v-if="msg.isPinned"
							name="pin"
							:size-scale="sizeScale * 0.65"
							class="base-chat-message-list__pin-icon" />
						<BaseText tag="span" :size-scale="sizeScale * 0.75" class="base-chat-message-list__time">
							{{ msg.time }}
						</BaseText>
						<template v-if="msg.sender === 'me' && msg.status">
							<BaseLoader
								v-if="msg.status === 'sending'"
								variant="spinner"
								:size-scale="sizeScale * 0.5"
								class="base-chat-message-list__status base-chat-message-list__status--sending" />
							<div
								v-else
								class="base-chat-message-list__status-wrapper"
								:class="`base-chat-message-list__status-wrapper--${msg.status}`">
								<BaseIcon name="check" :size-scale="sizeScale * 0.6" class="base-chat-message-list__status-icon" />
								<BaseIcon
									v-if="msg.status === 'read' || msg.status === 'delivered'"
									name="check"
									:size-scale="sizeScale * 0.6"
									class="base-chat-message-list__status-icon base-chat-message-list__status-icon--second" />
							</div>
						</template>
					</div>
				</div>
			</div>
		</div>

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
		<Teleport to="body">
			<div
				v-if="contextMenu.isOpen"
				ref="contextMenuRef"
				class="base-chat-context-menu"
				:style="{ top: `${contextMenu.y}px`, left: `${contextMenu.x}px` }">
				<div class="base-chat-context-menu__reactions">
					<button
						v-for="emoji in ['👍', '❤️', '🔥', '😂', '😮', '😢']"
						:key="emoji"
						type="button"
						class="base-chat-context-menu__reaction-btn"
						:aria-label="`Поставить реакцию ${emoji}`"
						@click="handleSelectReaction(emoji)">
						{{ emoji }}
					</button>
				</div>
				<div class="base-chat-context-menu__divider"></div>
				<button type="button" class="base-chat-context-menu__item" @click="handleContextMenuReply">
					<BaseIcon name="reply" :size-scale="sizeScale * 0.8" />
					<BaseText :size-scale="sizeScale * 0.9">Ответить</BaseText>
				</button>
				<button type="button" class="base-chat-context-menu__item" @click="handleContextMenuSelect">
					<BaseIcon name="check" :size-scale="sizeScale * 0.8" />
					<BaseText :size-scale="sizeScale * 0.9">Выбрать</BaseText>
				</button>
				<button type="button" class="base-chat-context-menu__item" @click="handleContextMenuCopy">
					<BaseIcon name="copy" :size-scale="sizeScale * 0.8" />
					<BaseText :size-scale="sizeScale * 0.9">Копировать текст</BaseText>
				</button>
				<button
					v-if="currentUserRole === 'admin'"
					type="button"
					class="base-chat-context-menu__item"
					@click="handleContextMenuPin">
					<BaseIcon :name="contextMenu.message?.isPinned ? 'unpin' : 'pin'" :size-scale="sizeScale * 0.8" />
					<BaseText :size-scale="sizeScale * 0.9">
						{{ contextMenu.message?.isPinned ? 'Открепить' : 'Закрепить' }}
					</BaseText>
				</button>
				<button
					v-if="currentUserRole === 'admin' || contextMenu.message?.sender === 'me'"
					type="button"
					class="base-chat-context-menu__item base-chat-context-menu__item--danger"
					@click="handleContextMenuDelete">
					<BaseIcon name="trash" :size-scale="sizeScale * 0.8" />
					<BaseText :size-scale="sizeScale * 0.9">Удалить</BaseText>
				</button>
			</div>
		</Teleport>
	</div>
</template>

<script setup lang="ts">
import { BaseAvatar } from '@components/BaseAvatar'
import { BaseButton } from '@components/BaseButton'
import { BaseCheckbox } from '@components/BaseCheckbox'
import { BaseIcon } from '@components/BaseIcon'
import { BaseImage } from '@components/BaseImage'
import { BaseLoader } from '@components/BaseLoader'
import { BaseText } from '@components/BaseText'
import { useAutoScroll } from '@composables/useAutoScroll'
import { useClickOutside } from '@composables/useClickOutside'
import { getExtension } from '@utils/fileUtils'
import { computed, ref } from 'vue'
import type { ChatMessage, ChatMessageAttachment } from '../BaseChat.types'
import './ChatMessageList.style.scss'
import type { ChatMessageListEmits, ChatMessageListProps } from './ChatMessageList.types'

const props = withDefaults(defineProps<ChatMessageListProps>(), {
	sizeScale: 100,
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

const listRef = ref<HTMLElement | null>(null)
const contextMenuRef = ref<HTMLElement | null>(null)

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
	watchSource: () => props.messages.length + (props.isTyping ? 1 : 0),
})

// Закрытие контекстного меню по клику снаружи
useClickOutside({
	targets: [contextMenuRef],
	callback: closeContextMenu,
	isActive: () => contextMenu.value.isOpen,
})

/** Проверка, выбрано ли сообщение */
function isSelected(messageId: string): boolean {
	return props.selectedMessageIds.includes(messageId)
}

/** Проверка, открыто ли контекстное меню для данного сообщения */
function isContextActive(messageId: string): boolean {
	return contextMenu.value.isOpen && contextMenu.value.message?.id === messageId
}

/** Проверка, активен ли режим выбора сообщений */
const isSelectionMode = computed(() => {
	return props.selectedMessageIds && props.selectedMessageIds.length > 0
})

/** Разделение вложений на картинки */
function getImages(msg: ChatMessage): ChatMessageAttachment[] {
	/* istanbul ignore next — defensive: attachments опционален, fallback на пустой массив */
	return msg.attachments?.filter(a => a.type === 'image') || []
}

/** Получение списка URL картинок сообщения для галереи */
function getMessageImagesUrls(msg: ChatMessage): string[] {
	return getImages(msg).map(img => img.url)
}

/** Разделение вложений на файлы */
function getFiles(msg: ChatMessage): ChatMessageAttachment[] {
	/* istanbul ignore next — defensive: attachments опционален, fallback на пустой массив */
	return msg.attachments?.filter(a => a.type !== 'image') || []
}

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
	const menuWidth = 200
	const menuHeight = 280
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
function handleContextMenuCopy(): void {
	/* istanbul ignore next — требует monkey-patch navigator.clipboard.writeText */
	if (contextMenu.value.message?.text) {
		navigator.clipboard.writeText(contextMenu.value.message.text)
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
	element.scrollIntoView({ behavior: 'smooth', block: 'center' })
	element.classList.add('base-chat-message-list__item--highlighted')
	setTimeout(() => {
		element.classList.remove('base-chat-message-list__item--highlighted')
	}, 1500)
}

defineExpose({ scrollToMessage })

interface TextPart {
	text: string
	isMatch: boolean
}

/**
 * Разделение обычного текстового сегмента на части для подсветки поиска.
 * Без активного searchQuery возвращает сегмент как единую часть без подсветки.
 */
function getHighlightedParts(text: string): TextPart[] {
	if (!props.searchQuery) {
		return [{ text, isMatch: false }]
	}

	const parts: TextPart[] = []
	const escapedQuery = props.searchQuery.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')
	const regex = new RegExp(`(${escapedQuery})`, 'gi')
	const matches = text.split(regex)

	for (const part of matches) {
		if (part) {
			const isMatch = part.toLowerCase() === props.searchQuery.toLowerCase()
			parts.push({ text: part, isMatch })
		}
	}

	return parts
}

interface MessageToken {
	type: 'text' | 'link' | 'mention' | 'command'
	value: string
}

/**
 * Единый разбор текста сообщения на токены: ссылки, @упоминания, /команды и обычный текст.
 * Упоминание — @ + буквы/цифры/подчёркивание. Команда — / + буквы/цифры в начале слова.
 */
function parseMessageText(text: string): MessageToken[] {
	/* istanbul ignore next — defensive: parseMessageText вызывается только при truthy msg.text (v-if в шаблоне) */
	if (!text) return []
	const tokenRegex = /(https?:\/\/[^\s]+|@[\wА-Яа-яЁё]+|(?:^|\s)\/[\wА-Яа-яЁё]+)/g
	const parts = text.split(tokenRegex)
	const tokens: MessageToken[] = []
	for (const part of parts) {
		if (!part) continue
		if (/^https?:\/\//i.test(part)) {
			tokens.push({ type: 'link', value: part })
		} else if (/^@[\wА-Яа-яЁё]+$/.test(part)) {
			tokens.push({ type: 'mention', value: part })
		} else if (/^\s?\/[\wА-Яа-яЁё]+$/.test(part)) {
			const leadingSpace = part.startsWith(' ')
			if (leadingSpace) tokens.push({ type: 'text', value: ' ' })
			tokens.push({ type: 'command', value: leadingSpace ? part.slice(1) : part })
		} else {
			tokens.push({ type: 'text', value: part })
		}
	}
	return tokens
}

/** Клик по @упоминанию в тексте сообщения */
function handleMentionClick(mention: string): void {
	emit('mention-click', mention.slice(1))
}

/** Клик по /команде в тексте сообщения */
function handleCommandClick(command: string): void {
	emit('command-click', command.slice(1))
}

/** Получение имени SVG-иконки по расширению файла */
function getFileIconName(filename: string): string {
	const ext = getExtension(filename).toLowerCase()
	const knownExtensions: Record<string, string> = {
		png: 'file-img',
		jpg: 'file-img',
		jpeg: 'file-img',
		gif: 'file-img',
		webp: 'file-img',
		svg: 'file-svg',
		js: 'file-js',
		ts: 'file-ts',
		vue: 'file-vue',
		scss: 'file-scss',
		css: 'file-css',
		html: 'file-html',
		json: 'file-json',
		md: 'file-md',
		txt: 'file-txt',
		xml: 'file-xml',
		yaml: 'file-yaml',
		yml: 'file-yaml',
		sh: 'file-sh',
		py: 'file-py',
		sql: 'file-sql',
		pdf: 'file-txt',
		doc: 'file-txt',
		docx: 'file-txt',
		xls: 'file-txt',
		xlsx: 'file-txt',
		ppt: 'file-txt',
		pptx: 'file-txt',
		mp3: 'file-config',
		wav: 'file-config',
		mp4: 'file-config',
		mkv: 'file-config',
		zip: 'file-lock',
		rar: 'file-lock',
		'7z': 'file-lock',
	}
	return knownExtensions[ext] || 'file-config'
}
</script>
