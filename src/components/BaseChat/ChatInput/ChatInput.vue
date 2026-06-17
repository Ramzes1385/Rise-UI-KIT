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
				:aria-label="`${UI_CHAT_QUICK_REPLY} ${reply}`"
				@click="handleQuickReply(reply)">
				<BaseText :size-scale="sizeScale * UI_SCALE.SMALL" :weight="UI_FONT_WEIGHT.MEDIUM">{{ reply }}</BaseText>
			</BaseButton>
		</div>

		<!-- Панель ответа на сообщение -->
		<div v-if="replyingTo" class="base-chat-input__reply-bar">
			<div class="base-chat-input__reply-info">
				<BaseIcon name="reply" :size-scale="sizeScale * UI_SCALE.SMALL" class="base-chat-input__reply-icon" />
				<div class="base-chat-input__reply-content">
					<BaseText tag="span" :weight="UI_FONT_WEIGHT.SEMIBOLD" :size-scale="sizeScale * UI_SCALE.SMALL" class="base-chat-input__reply-sender">
						{{ replyingTo.senderName || UI_CHAT_MESSAGE_PLACEHOLDER }}
					</BaseText>
					<BaseText tag="p" :size-scale="sizeScale * UI_CHAT_SCALE_ICON" class="base-chat-input__reply-text">
						{{ replyingTo.text }}
					</BaseText>
				</div>
			</div>
			<BaseButton
				variant="ghost"
				:padding="1"
				:size-scale="sizeScale * UI_SCALE.SMALL"
				class="base-chat-input__reply-cancel"
				:aria-label="UI_CHAT_CANCEL_REPLY_ARIA"
				@click="handleCancelReply">
				<template #left>
					<BaseIcon name="close" :size-scale="sizeScale * UI_SCALE.SMALL" />
				</template>
			</BaseButton>
		</div>

		<!-- Список выбранных файлов (превью) -->
		<ChatFilePreview
			v-if="attachments.length > 0"
			:attachments="attachments"
			:size-scale="sizeScale"
			@remove="removeAttachment" />

		<div class="base-chat-input__controls">
			<BaseButton
				variant="ghost"
				:padding="2"
				:size-scale="sizeScale"
				class="base-chat-input__attach-btn"
				:aria-label="UI_CHAT_ATTACH_ARIA"
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
				:aria-label="UI_CHAT_FILE_SELECT_ARIA"
				@change="handleFileChange" />

			<!-- Кнопка команд (как в Telegram) — появляется только если есть команды -->
			<BaseButton
				v-if="hasCommands"
				variant="ghost"
				:padding="2"
				:size-scale="sizeScale"
				class="base-chat-input__commands-btn"
				:class="{ 'base-chat-input__commands-btn--active': showCommands }"
				:aria-label="UI_CHAT_SHOW_COMMANDS_ARIA"
				@click="toggleCommands">
				<template #left>
					<BaseIcon name="code" :size-scale="sizeScale" />
				</template>
			</BaseButton>

			<ChatEmojiPicker :size-scale="sizeScale" @select="insertEmoji" />

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
						<BaseAvatar :src="member.avatar" :name="member.name" :size-scale="sizeScale * UI_CHAT_SCALE_STATUS" />
						<div class="base-chat-input__autocomplete-info">
							<BaseText :size-scale="sizeScale * UI_SCALE.AUTOCOMPLETE" :weight="UI_FONT_WEIGHT.SEMIBOLD">{{ member.name }}</BaseText>
							<BaseText v-if="member.role" :size-scale="sizeScale * UI_CHAT_SCALE_META" class="base-chat-input__autocomplete-sub">
								{{ member.role === 'admin' ? UI_CHAT_ADMIN : UI_CHAT_MEMBER }}
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
						<BaseIcon name="file-config" :size-scale="sizeScale * UI_CHAT_SCALE_ICON" class="base-chat-input__autocomplete-icon" />
						<div class="base-chat-input__autocomplete-info">
							<BaseText :size-scale="sizeScale * UI_SCALE.AUTOCOMPLETE" :weight="UI_FONT_WEIGHT.SEMIBOLD">/{{ command.name }}</BaseText>
							<BaseText :size-scale="sizeScale * UI_CHAT_SCALE_META" class="base-chat-input__autocomplete-sub">
								{{ command.description }}
							</BaseText>
						</div>
					</div>
				</div>

				<BaseInput
					ref="inputComponentRef"
					v-model="text"
					:placeholder="UI_CHAT_MESSAGE_INPUT"
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
					:aria-label="UI_CHAT_SEND_ARIA"
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
import {
	UI_CHAT_ADMIN,
	UI_CHAT_ATTACH_ARIA,
	UI_CHAT_CANCEL_REPLY_ARIA,
	UI_CHAT_FILE_SELECT_ARIA,
	UI_CHAT_MEMBER,
	UI_CHAT_MESSAGE_INPUT,
	UI_CHAT_MESSAGE_PLACEHOLDER,
	UI_CHAT_QUICK_REPLY,
	UI_CHAT_SCALE_ICON,
	UI_CHAT_SCALE_META,
	UI_CHAT_SCALE_STATUS,
	UI_CHAT_SEND_ARIA,
	UI_CHAT_SHOW_COMMANDS_ARIA,
	UI_FONT_WEIGHT,
	UI_SCALE,
	SIZE_SCALE_DEFAULT,
} from '@constants'
import { BaseAvatar } from '@components/BaseAvatar'
import { BaseButton } from '@components/BaseButton'
import { BaseIcon } from '@components/BaseIcon'
import { BaseInput } from '@components/BaseInput'
import ChatFilePreview from './ChatFilePreview.vue'
import { BaseText } from '@components/BaseText'
import { formatFileSize } from '@utils/fileUtils'
import { generateId } from '@utils/idUtils'
import { toHTMLInputElement } from '@utils/domUtils'
import { computed, nextTick, ref, watch } from 'vue'
import type { ChatMessageAttachment } from '../model/BaseChat.types'
import ChatEmojiPicker from './ChatEmojiPicker.vue'
import './ChatInput.style.scss'
import type { ChatInputEmits, ChatInputProps } from './ChatInput.types'

interface BaseInputExposed {
	inputRef: HTMLInputElement | null
}

const props = withDefaults(defineProps<ChatInputProps>(), {
	sizeScale: SIZE_SCALE_DEFAULT,
	replyingTo: null,
	quickReplies: () => [],
	members: () => [],
	commands: () => [],
})

const emit = defineEmits<ChatInputEmits>()

const text = ref('')
const fileInputRef = ref<HTMLInputElement | null>(null)
const attachments = ref<ChatMessageAttachment[]>([])

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
const hasCommands = computed(() => props.commands.length > 0)

const filteredMembers = computed(() => {
	const query = mentionQuery.value
	return props.members.filter(
		member => member.name.toLowerCase().includes(query) || (member.role && member.role.toLowerCase().includes(query)),
	)
})

const filteredCommands = computed(() => {
	const query = commandQuery.value
	return props.commands.filter(command => command.name.toLowerCase().includes(query))
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

function handleSuggestionNavigation(
	event: KeyboardEvent,
	items: { name: string }[],
	prefix: string,
	showFlag: { value: boolean },
): boolean {
	if (items.length === 0) return false

	if (event.key === 'ArrowDown') {
		event.preventDefault()
		activeSuggestionIndex.value = (activeSuggestionIndex.value + 1) % items.length
		return true
	}

	if (event.key === 'ArrowUp') {
		event.preventDefault()
		activeSuggestionIndex.value = (activeSuggestionIndex.value - 1 + items.length) % items.length
		return true
	}

	if (event.key === 'Enter') {
		event.preventDefault()
		const selected = items[activeSuggestionIndex.value]
		if (!selected) return true

		const nextText = replaceCurrentWord(prefix, selected.name)
		if (nextText) {
			sendMessage(nextText)
		}

		return true
	}

	if (event.key === 'Escape') {
		event.preventDefault()
		showFlag.value = false
		return true
	}

	return false
}

function handleKeyDown(event: KeyboardEvent): void {
	if (showMentions.value && handleSuggestionNavigation(event, filteredMembers.value, '@', showMentions)) return
	if (showCommands.value && handleSuggestionNavigation(event, filteredCommands.value, '/', showCommands)) return

	if (event.key === 'Enter' && !event.shiftKey) {
		event.preventDefault()
		handleSend()
	}
}

/** Триггер выбора файлов */
function triggerFileSelect(): void {
	fileInputRef.value?.click()
}

/** Обработка изменения файлов */
function handleFileChange(event: Event): void {
	const target = toHTMLInputElement(event.target)
	if (!target) return
	/* istanbul ignore next -- defensive: change-событие input[type=file] всегда с files */
	if (!target.files || target.files.length === 0) return

	emit('attach', target.files)

	for (let index = 0; index < target.files.length; index++) {
		const file = target.files[index]
		const isImage = file.type.startsWith('image/')
		attachments.value.push({
			id: generateId(),
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
