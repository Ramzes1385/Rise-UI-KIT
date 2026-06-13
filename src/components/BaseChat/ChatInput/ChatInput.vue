<template>
	<div class="base-chat-input">
		<!-- Панель быстрых ответов -->
		<div v-if="quickReplies && quickReplies.length > 0" class="base-chat-input__quick-replies">
			<BaseButton
				v-for="reply in quickReplies"
				:key="reply"
				variant="ghost"
				:padding="{ x: 12, y: 6 }"
				custom-class="base-chat-input__quick-reply-btn"
				:aria-label="`Быстрый ответ: ${reply}`"
				@click="handleQuickReply(reply)">
				<BaseText :size-scale="sizeScale * 0.8" :weight="500">{{ reply }}</BaseText>
			</BaseButton>
		</div>

		<!-- Панель ответа на сообщение -->
		<div v-if="replyingTo" class="base-chat-input__reply-bar">
			<div class="base-chat-input__reply-info">
				<BaseIcon name="reply" :size-scale="sizeScale * 0.8" class="base-chat-input__reply-icon" />
				<div class="base-chat-input__reply-content">
					<BaseText tag="span" :weight="600" :size-scale="sizeScale * 0.8" class="base-chat-input__reply-sender">
						{{ replyingTo.senderName || 'Сообщение' }}
					</BaseText>
					<BaseText tag="p" :size-scale="sizeScale * 0.75" class="base-chat-input__reply-text">
						{{ replyingTo.text }}
					</BaseText>
				</div>
			</div>
			<BaseButton
				variant="ghost"
				:padding="1"
				:size-scale="sizeScale * 0.8"
				class="base-chat-input__reply-cancel"
				aria-label="Отменить ответ на сообщение"
				@click="handleCancelReply">
				<template #left>
					<BaseIcon name="close" :size-scale="sizeScale * 0.8" />
				</template>
			</BaseButton>
		</div>

		<!-- Список выбранных файлов (превью) -->
		<div v-if="attachments.length > 0" class="base-chat-input__previews">
			<div v-for="(file, index) in attachments" :key="file.id" class="base-chat-input__preview">
				<BaseImage
					v-if="file.type === 'image'"
					:src="file.url"
					:alt="file.name"
					class="base-chat-input__preview-image" />
				<div v-else class="base-chat-input__preview-file">
					<BaseIcon name="file" :size-scale="sizeScale * 0.8" />
					<BaseText tag="span" :size-scale="sizeScale * 0.8" class="base-chat-input__preview-filename">
						{{ file.name }}
					</BaseText>
				</div>
				<BaseButton
					variant="ghost"
					:padding="1"
					:size-scale="sizeScale * 0.7"
					class="base-chat-input__preview-remove"
					:aria-label="`Удалить вложение ${file.name}`"
					@click="removeAttachment(index)">
					<template #left>
						<BaseIcon name="close" :size-scale="sizeScale * 0.7" />
					</template>
				</BaseButton>
			</div>
		</div>

		<div class="base-chat-input__controls">
			<BaseButton
				variant="ghost"
				:padding="2"
				:size-scale="sizeScale"
				class="base-chat-input__attach-btn"
				aria-label="Прикрепить файл"
				@click="triggerFileSelect">
				<template #left>
					<BaseIcon name="attach" :size-scale="sizeScale" />
				</template>
			</BaseButton>

			<input
				ref="fileInputRef"
				type="file"
				multiple
				class="base-chat-input__file-input"
				aria-label="Выбор файлов для прикрепления"
				@change="handleFileChange" />

			<!-- Кнопка команд (как в Telegram) — появляется только если есть команды -->
			<BaseButton
				v-if="hasCommands"
				variant="ghost"
				:padding="2"
				:size-scale="sizeScale"
				class="base-chat-input__commands-btn"
				:class="{ 'base-chat-input__commands-btn--active': showCommands }"
				aria-label="Показать команды"
				@click="toggleCommands">
				<template #left>
					<BaseIcon name="code" :size-scale="sizeScale" />
				</template>
			</BaseButton>

			<!-- Кнопка эмодзи с поповером -->
			<div ref="emojiWrapperRef" class="base-chat-input__emoji-wrapper">
				<BaseButton
					variant="ghost"
					:padding="2"
					:size-scale="sizeScale"
					class="base-chat-input__emoji-btn"
					aria-label="Открыть выбор эмодзи"
					@click="toggleEmoji">
					<template #left>
						<BaseIcon name="smile" :size-scale="sizeScale" />
					</template>
				</BaseButton>

				<div v-if="isEmojiOpen" ref="emojiPopoverRef" class="base-chat-input__emoji-popover">
					<div class="base-chat-input__emoji-list">
						<BaseButton
							v-for="emoji in popularEmojis"
							:key="emoji"
							variant="ghost"
							:padding="{ x: 4, y: 4 }"
							custom-class="base-chat-input__emoji-item"
							:aria-label="`Вставить эмодзи ${emoji}`"
							@click="insertEmoji(emoji)">
							{{ emoji }}
						</BaseButton>
					</div>
				</div>
			</div>

			<div class="base-chat-input__field-container">
				<!-- Выпадающий список упоминаний (@) -->
				<div
					v-if="showMentions && filteredMembers.length > 0"
					class="base-chat-input__autocomplete base-chat-input__autocomplete--mentions">
					<div
						v-for="(member, index) in filteredMembers"
						:key="member.id"
						class="base-chat-input__autocomplete-item"
						:class="{ 'base-chat-input__autocomplete-item--active': index === activeSuggestionIndex }"
						@click="replaceCurrentWord('@', member.name)">
						<BaseAvatar :src="member.avatar" :name="member.name" :size-scale="sizeScale * 0.6" />
						<div class="base-chat-input__autocomplete-info">
							<BaseText :size-scale="sizeScale * 0.85" :weight="600">{{ member.name }}</BaseText>
							<BaseText v-if="member.role" :size-scale="sizeScale * 0.7" class="base-chat-input__autocomplete-sub">
								{{ member.role === 'admin' ? 'Администратор' : 'Участник' }}
							</BaseText>
						</div>
					</div>
				</div>

				<!-- Выпадающий список команд (/) -->
				<div
					v-if="showCommands && filteredCommands.length > 0"
					class="base-chat-input__autocomplete base-chat-input__autocomplete--commands">
					<div
						v-for="(command, index) in filteredCommands"
						:key="command.name"
						class="base-chat-input__autocomplete-item"
						:class="{ 'base-chat-input__autocomplete-item--active': index === activeSuggestionIndex }"
						@click="replaceCurrentWord('/', command.name)">
						<BaseIcon name="file-config" :size-scale="sizeScale * 0.75" class="base-chat-input__autocomplete-icon" />
						<div class="base-chat-input__autocomplete-info">
							<BaseText :size-scale="sizeScale * 0.85" :weight="600">/{{ command.name }}</BaseText>
							<BaseText :size-scale="sizeScale * 0.7" class="base-chat-input__autocomplete-sub">
								{{ command.description }}
							</BaseText>
						</div>
					</div>
				</div>

				<BaseInput
					ref="inputComponentRef"
					v-model="text"
					placeholder="Напишите сообщение..."
					:size-scale="sizeScale"
					class="base-chat-input__field"
					@keydown="handleKeyDown"
					@keyup="checkAutocomplete"
					@click="checkAutocomplete" />
			</div>

			<div class="base-chat-input__send-btn-container">
				<BaseButton
					variant="default"
					:padding="2"
					:size-scale="sizeScale"
					:disabled="!text.trim() && attachments.length === 0"
					class="base-chat-input__send-btn"
					aria-label="Отправить сообщение"
					@click="handleSend">
					<template #left>
						<BaseIcon name="send" :size-scale="sizeScale" />
					</template>
				</BaseButton>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { BaseAvatar } from '@components/BaseAvatar'
import { BaseButton } from '@components/BaseButton'
import { BaseIcon } from '@components/BaseIcon'
import { BaseImage } from '@components/BaseImage'
import { BaseInput } from '@components/BaseInput'
import { BaseText } from '@components/BaseText'
import { useClickOutside } from '@composables/useClickOutside'
import { formatFileSize } from '@utils/fileUtils'
import { computed, nextTick, ref, watch } from 'vue'
import type { ChatCommand, ChatMember, ChatMessageAttachment } from '../BaseChat.types'
import './ChatInput.style.scss'
import type { ChatInputEmits, ChatInputProps } from './ChatInput.types'

interface BaseInputExposed {
	inputRef: HTMLInputElement | null
}

const EMPTY_QUICK_REPLIES: string[] = []
const EMPTY_MEMBERS: ChatMember[] = []
const EMPTY_COMMANDS: ChatCommand[] = []

const props = defineProps<ChatInputProps>()

const emit = defineEmits<ChatInputEmits>()

const sizeScale = computed(() => props.sizeScale ?? 100)
const replyingTo = computed(() => props.replyingTo ?? null)
const quickReplies = computed(() => props.quickReplies ?? EMPTY_QUICK_REPLIES)
const members = computed(() => props.members ?? EMPTY_MEMBERS)
const commands = computed(() => props.commands ?? EMPTY_COMMANDS)

const text = ref('')
const fileInputRef = ref<HTMLInputElement | null>(null)
const attachments = ref<ChatMessageAttachment[]>([])
const isEmojiOpen = ref(false)

const inputComponentRef = ref<BaseInputExposed | null>(null)
const showMentions = ref(false)
const showCommands = ref(false)
const mentionQuery = ref('')
const commandQuery = ref('')
const activeSuggestionIndex = ref(0)

function getInputElement(): HTMLInputElement | null {
	return inputComponentRef.value?.inputRef ?? null
}

/** Доступны ли команды в чате */
const hasCommands = computed(() => commands.value.length > 0)

const filteredMembers = computed(() => {
	const query = mentionQuery.value
	return members.value.filter(
		member => member.name.toLowerCase().includes(query) || (member.role && member.role.toLowerCase().includes(query)),
	)
})

const filteredCommands = computed(() => {
	const query = commandQuery.value
	return commands.value.filter(command => command.name.toLowerCase().includes(query))
})

function checkAutocomplete(): void {
	const inputEl = getInputElement()
	/* istanbul ignore next — defensive: inputRef доступен после mount BaseInput */
	if (!inputEl) {
		showMentions.value = false
		showCommands.value = false
		return
	}

	/* istanbul ignore next — defensive: selectionStart всегда number для HTMLInputElement */
	const cursorPosition = inputEl.selectionStart ?? 0
	const textBeforeCursor = text.value.slice(0, cursorPosition)

	const lastSpaceIndex = textBeforeCursor.lastIndexOf(' ')
	const currentWord = lastSpaceIndex === -1 ? textBeforeCursor : textBeforeCursor.slice(lastSpaceIndex + 1)

	if (currentWord.startsWith('@')) {
		if (!showMentions.value) {
			activeSuggestionIndex.value = 0
		}
		showMentions.value = true
		showCommands.value = false
		mentionQuery.value = currentWord.slice(1).toLowerCase()
	} else if (currentWord.startsWith('/')) {
		if (!showCommands.value) {
			activeSuggestionIndex.value = 0
		}
		showCommands.value = true
		showMentions.value = false
		commandQuery.value = currentWord.slice(1).toLowerCase()
	} else {
		showMentions.value = false
		showCommands.value = false
	}
}

watch(text, () => {
	nextTick(() => {
		checkAutocomplete()
	})
})

/**
 * Заменяет текущее слово перед курсором на значение с заданным префиксом.
 * Используется для автодополнения @упоминаний и /команд.
 */
function replaceCurrentWord(prefix: string, value: string): string | null {
	const inputEl = getInputElement()
	/* istanbul ignore next — defensive: inputRef доступен после mount BaseInput */
	if (!inputEl) return null

	/* istanbul ignore next — defensive: selectionStart всегда number для HTMLInputElement */
	const cursorPosition = inputEl.selectionStart ?? 0
	const textBeforeCursor = text.value.slice(0, cursorPosition)
	const textAfterCursor = text.value.slice(cursorPosition)

	const lastSpaceIndex = textBeforeCursor.lastIndexOf(' ')
	const newTextBefore =
		lastSpaceIndex === -1
			? `${prefix}${value} `
			: textBeforeCursor.slice(0, lastSpaceIndex + 1) + `${prefix}${value} `

	const nextText = newTextBefore + textAfterCursor

	text.value = nextText
	showMentions.value = false
	showCommands.value = false

	nextTick(() => {
		inputEl.focus()
		const newCursorPos = newTextBefore.length
		inputEl.setSelectionRange(newCursorPos, newCursorPos)
	})

	return nextText
}

/**
 * Клик по кнопке команд (как в Telegram): открывает/закрывает список всех команд.
 * Если список уже открыт — закрывает. Иначе вставляет "/" в позицию каретки
 * (с ведущим пробелом, если перед кареткой уже есть текст), чтобы текущее слово
 * начиналось со слеша — тогда список команд остаётся открытым стабильно.
 */
function toggleCommands(): void {
	if (showCommands.value) {
		showCommands.value = false
		return
	}

	const inputEl = getInputElement()
	/* istanbul ignore next — defensive: selectionStart всегда number для HTMLInputElement */
	const cursorPosition = inputEl?.selectionStart ?? text.value.length
	const textBeforeCursor = text.value.slice(0, cursorPosition)
	const textAfterCursor = text.value.slice(cursorPosition)

	const needsLeadingSpace = textBeforeCursor.length > 0 && !textBeforeCursor.endsWith(' ')
	const inserted = needsLeadingSpace ? ' /' : '/'
	const newTextBefore = textBeforeCursor + inserted

	commandQuery.value = ''
	activeSuggestionIndex.value = 0
	showMentions.value = false
	showCommands.value = true
	text.value = newTextBefore + textAfterCursor

	nextTick(() => {
		/* istanbul ignore next — defensive: inputRef доступен после mount BaseInput */
		if (!inputEl) return
		inputEl.focus()
		const caret = newTextBefore.length
		inputEl.setSelectionRange(caret, caret)
	})
}

function handleKeyDown(event: KeyboardEvent): void {
	if (showMentions.value && filteredMembers.value.length > 0) {
		if (event.key === 'ArrowDown') {
			event.preventDefault()
			activeSuggestionIndex.value = (activeSuggestionIndex.value + 1) % filteredMembers.value.length
			return
		}

		if (event.key === 'ArrowUp') {
			event.preventDefault()
			activeSuggestionIndex.value =
				(activeSuggestionIndex.value - 1 + filteredMembers.value.length) % filteredMembers.value.length
			return
		}

		if (event.key === 'Enter') {
			event.preventDefault()

			const selectedMember = filteredMembers.value[activeSuggestionIndex.value]
			if (!selectedMember) return

			const nextText = replaceCurrentWord('@', selectedMember.name)
			if (nextText) {
				sendMessage(nextText)
			}

			return
		}

		if (event.key === 'Escape') {
			event.preventDefault()
			showMentions.value = false
			return
		}
	}

	if (showCommands.value && filteredCommands.value.length > 0) {
		if (event.key === 'ArrowDown') {
			event.preventDefault()
			activeSuggestionIndex.value = (activeSuggestionIndex.value + 1) % filteredCommands.value.length
			return
		}

		if (event.key === 'ArrowUp') {
			event.preventDefault()
			activeSuggestionIndex.value =
				(activeSuggestionIndex.value - 1 + filteredCommands.value.length) % filteredCommands.value.length
			return
		}

		if (event.key === 'Enter') {
			event.preventDefault()

			const selectedCommand = filteredCommands.value[activeSuggestionIndex.value]
			if (!selectedCommand) return

			const nextText = replaceCurrentWord('/', selectedCommand.name)
			if (nextText) {
				sendMessage(nextText)
			}

			return
		}

		if (event.key === 'Escape') {
			event.preventDefault()
			showCommands.value = false
			return
		}
	}

	if (event.key === 'Enter' && !event.shiftKey) {
		event.preventDefault()
		handleSend()
	}
}

const emojiWrapperRef = ref<HTMLElement | null>(null)

useClickOutside({
	targets: [emojiWrapperRef],
	callback: () => {
		isEmojiOpen.value = false
	},
	isActive: () => isEmojiOpen.value,
})

/** Переключение видимости поповера эмодзи */
function toggleEmoji(): void {
	isEmojiOpen.value = !isEmojiOpen.value
}

/** Популярные эмодзи для быстрого выбора */
const popularEmojis = [
	'😀',
	'😂',
	'😊',
	'😍',
	'👍',
	'👎',
	'🔥',
	'🎉',
	'❤️',
	'🤔',
	'😎',
	'🙌',
	'👏',
	'🚀',
	'✨',
	'👀',
	'😢',
	'😡',
	'💩',
	'💯',
	'🙏',
	'💡',
	'📌',
	'📎',
]

/** Триггер выбора файлов */
function triggerFileSelect(): void {
	fileInputRef.value?.click()
}

/** Обработка изменения файлов */
function handleFileChange(event: Event): void {
	const target = event.target as HTMLInputElement
	/* istanbul ignore next -- defensive: change-событие input[type=file] всегда с files */
	if (!target.files || target.files.length === 0) return

	emit('attach', target.files)

	for (let index = 0; index < target.files.length; index++) {
		const file = target.files[index]
		const isImage = file.type.startsWith('image/')
		attachments.value.push({
			id: Math.random().toString(36).substring(2, 9),
			name: file.name,
			type: isImage ? 'image' : 'file',
			url: URL.createObjectURL(file),
			size: formatFileSize(file.size),
		})
	}

	target.value = ''
}

/** Удаление вложения */
function removeAttachment(index: number): void {
	const attachment = attachments.value[index]
	if (attachment.url.startsWith('blob:')) {
		URL.revokeObjectURL(attachment.url)
	}
	attachments.value.splice(index, 1)
}

/** Вставка эмодзи в поле ввода */
function insertEmoji(emoji: string): void {
	text.value += emoji
	isEmojiOpen.value = false
}

/** Отмена ответа на сообщение */
function handleCancelReply(): void {
	emit('cancel-reply')
}

function sendMessage(messageText = text.value): void {
	const trimmedText = messageText.trim()
	if (!trimmedText && attachments.value.length === 0) return

	emit('send', {
		text: trimmedText,
		attachments: attachments.value.length > 0 ? [...attachments.value] : undefined,
	})

	text.value = ''
	attachments.value = []
}

/** Отправка сообщения */
function handleSend(): void {
	sendMessage()
}

/** Обработка выбора быстрого ответа */
function handleQuickReply(reply: string): void {
	emit('quick-reply', reply)
}
</script>
