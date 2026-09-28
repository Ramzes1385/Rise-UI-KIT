<template>
	<div class="base-chat-input">
		<div v-if="quickReplies && quickReplies.length > 0" class="base-chat-input__quick-replies">
			<BaseButton
				v-for="reply in quickReplies"
				:key="reply"
				variant="outline"
				:size-scale="sizeScale * QUICK_REPLY_SCALE"
				class="base-chat-input__quick-reply-btn"
				:aria-label="`${UI_CHAT_TEXT.QUICK_REPLY} ${reply}`"
				@click="handleQuickReply(reply)">
				{{ reply }}
			</BaseButton>
		</div>

		<div v-if="replyingTo" class="base-chat-input__reply-bar">
			<BaseIcon name="reply" :size-scale="sizeScale * CHAT_SCALE.SMALL" class="base-chat-input__reply-icon" />
			<div class="base-chat-input__reply-content">
				<span class="base-chat-input__reply-sender">{{ replyingTo.senderName || UI_CHAT_TEXT.MESSAGE_PLACEHOLDER }}</span>
				<span class="base-chat-input__reply-text">{{ replyingTo.text }}</span>
			</div>
			<BaseButton
				variant="ghost"
				:size-scale="sizeScale"
				class="base-chat-input__reply-cancel"
				:aria-label="UI_CHAT_TEXT.CANCEL_REPLY_ARIA"
				@click="handleCancelReply">
				<BaseIcon name="close" :size-scale="sizeScale * CHAT_SCALE.SMALL" />
			</BaseButton>
		</div>

		<ChatFilePreview v-if="attachments.length > 0" :attachments="attachments" :size-scale="sizeScale" @remove="removeAttachment" />

		<div class="base-chat-input__controls">
			<BaseButton
				variant="ghost"
				:size-scale="sizeScale"
				class="base-chat-input__attach-btn"
				:aria-label="UI_CHAT_TEXT.ATTACH_ARIA"
				@click="triggerFileSelect">
				<BaseIcon name="attach" :size-scale="sizeScale" />
			</BaseButton>

			<input
				ref="fileInputRef"
				type="file"
				multiple
				class="base-chat-input__file-input"
				tabindex="-1"
				:aria-label="UI_CHAT_TEXT.FILE_SELECT_ARIA"
				@change="handleFileChange" />

			<!-- Кнопка команд (как в Telegram) — появляется только если есть команды -->
			<BaseButton
				v-if="hasCommands"
				variant="ghost"
				:size-scale="sizeScale"
				class="base-chat-input__commands-btn"
				:class="{ 'base-chat-input__commands-btn--active': showCommands }"
				:aria-label="UI_CHAT_TEXT.SHOW_COMMANDS_ARIA"
				:aria-expanded="showCommands ? 'true' : 'false'"
				@click="toggleCommands">
				<BaseIcon name="code" :size-scale="sizeScale" />
			</BaseButton>

			<ChatEmojiPicker :size-scale="sizeScale" @select="insertEmoji" />

			<div class="base-chat-input__field-container">
				<!-- Подсказки упоминаний (@) и команд (/): список связан с полем через aria-controls и aria-activedescendant,
					стрелки выбирают пункт, Enter подставляет, Escape закрывает -->
				<div
					v-if="showMentions && filteredMembers.length > 0"
					:id="suggestionsId"
					class="base-chat-input__autocomplete base-chat-input__autocomplete--mentions"
					role="listbox"
					:aria-label="UI_CHAT_TEXT.MENTIONS_LIST">
					<div
						v-for="(member, index) in filteredMembers"
						:id="`${suggestionsId}-${index}`"
						:key="member.id"
						class="base-chat-input__autocomplete-item"
						:class="{ 'base-chat-input__autocomplete-item--active': index === activeSuggestionIndex }"
						role="option"
						:aria-selected="index === activeSuggestionIndex ? 'true' : 'false'"
						@mousedown.prevent
						@click="replaceCurrentWord('@', member.name)">
						<BaseAvatar :src="member.avatar" :name="member.name" :size-scale="sizeScale * CHAT_SCALE.MENTION_AVATAR" />
						<span class="base-chat-input__autocomplete-info">
							<span class="base-chat-input__autocomplete-title">{{ member.name }}</span>
							<span v-if="member.role" class="base-chat-input__autocomplete-sub">
								{{ member.role === 'admin' ? UI_CHAT_TEXT.ADMIN : UI_CHAT_TEXT.MEMBER }}
							</span>
						</span>
					</div>
				</div>

				<div
					v-if="showCommands && filteredCommands.length > 0"
					:id="suggestionsId"
					class="base-chat-input__autocomplete base-chat-input__autocomplete--commands"
					role="listbox"
					:aria-label="UI_CHAT_TEXT.COMMANDS_LIST">
					<div
						v-for="(command, index) in filteredCommands"
						:id="`${suggestionsId}-${index}`"
						:key="command.name"
						class="base-chat-input__autocomplete-item"
						:class="{ 'base-chat-input__autocomplete-item--active': index === activeSuggestionIndex }"
						role="option"
						:aria-selected="index === activeSuggestionIndex ? 'true' : 'false'"
						@mousedown.prevent
						@click="replaceCurrentWord('/', command.name)">
						<span class="base-chat-input__autocomplete-icon" aria-hidden="true">
							<BaseIcon name="file-config" :size-scale="sizeScale * CHAT_SCALE.SMALL" />
						</span>
						<span class="base-chat-input__autocomplete-info">
							<span class="base-chat-input__autocomplete-title">/{{ command.name }}</span>
							<span class="base-chat-input__autocomplete-sub">{{ command.description }}</span>
						</span>
					</div>
				</div>

				<!-- Поле сообщения: Enter — отправить, Shift+Enter — новая строка; высота растёт с текстом -->
				<textarea
					:ref="setTextareaRef"
					v-model="text"
					rows="1"
					class="base-chat-input__field"
					:placeholder="UI_CHAT_TEXT.MESSAGE_INPUT"
					:aria-label="UI_CHAT_TEXT.MESSAGE_PLACEHOLDER"
					aria-autocomplete="list"
					:aria-controls="isSuggestionsOpen ? suggestionsId : undefined"
					:aria-activedescendant="isSuggestionsOpen ? `${suggestionsId}-${activeSuggestionIndex}` : undefined"
					@keydown="handleKeyDown"
					@keyup="handleKeyUp"
					@click="checkAutocomplete"></textarea>
			</div>

			<BaseButton
				:size-scale="sizeScale"
				:is-disabled="!text.trim() && attachments.length === 0"
				class="base-chat-input__send-btn"
				:aria-label="UI_CHAT_TEXT.SEND_ARIA"
				@click="handleSend">
				<BaseIcon name="send" :size-scale="sizeScale" />
			</BaseButton>
		</div>
	</div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, useId, watch } from 'vue'
import { BaseIcon } from '@components/BaseIcon'
import { UI_CHAT_TEXT } from '@/locales/messages'
import { BaseAvatar } from '@components/BaseAvatar'
import { BaseButton } from '@components/BaseButton'
import { SIZE_SCALE_DEFAULT } from '@composables/useBaseComponent'
import { useChatInputState } from '@composables/useChatInputState'
import { CHAT_SCALE } from '../../model/chatScale'
import ChatEmojiPicker from './ChatEmojiPicker.vue'
import ChatFilePreview from './ChatFilePreview.vue'
import './ChatInput.style.scss'
import type { ChatInputEmits, ChatInputProps } from './types/ChatInput.types'

/** Быстрые ответы — пилюли размера sm (28px) */
const QUICK_REPLY_SCALE = 0.875

const props = withDefaults(defineProps<ChatInputProps>(), {
	sizeScale: SIZE_SCALE_DEFAULT,
	replyingTo: null,
	quickReplies: () => [],
	members: () => [],
	commands: () => [],
})

const emit = defineEmits<ChatInputEmits>()

const {
	text,
	fileInputRef,
	attachments,
	inputComponentRef,
	showMentions,
	showCommands,
	activeSuggestionIndex,
	hasCommands,
	filteredMembers,
	filteredCommands,
	checkAutocomplete,
	replaceCurrentWord,
	toggleCommands,
	handleKeyDown,
	triggerFileSelect,
	handleFileChange,
	removeAttachment,
	insertEmoji,
	handleSend,
} = useChatInputState({ props, emit })

const suggestionsId = useId()

/** Открыт непустой список подсказок — поле ссылается на него и на выбранный пункт */
const isSuggestionsOpen = computed(
	() => (showMentions.value && filteredMembers.value.length > 0) || (showCommands.value && filteredCommands.value.length > 0),
)

/** Поле ввода для useChatInputState: позиция курсора, фокус, подстановка упоминаний и команд */
function setTextareaRef(element: unknown): void {
	inputComponentRef.value = element instanceof HTMLTextAreaElement ? { inputRef: element } : null
}

/**
 * Высота поля подстраивается под текст (от одной строки до max-height из стилей, дальше — прокрутка).
 * Сначала высота сбрасывается в auto: иначе scrollHeight не меньше текущей высоты и поле только растёт.
 */
function adjustFieldHeight(): void {
	const field = inputComponentRef.value?.inputRef
	if (!field) return
	field.style.height = 'auto'
	if (field.scrollHeight === 0) {
		field.style.height = ''
		return
	}
	const borders = field.offsetHeight - field.clientHeight
	field.style.height = `${field.scrollHeight + borders}px`
}

watch(text, () => nextTick(adjustFieldHeight))
onMounted(adjustFieldHeight)

/**
 * Подсказки пересчитываются после отпускания клавиши (курсор мог сместиться стрелками или Home/End).
 * Кроме Escape: он закрыл список на keydown, и пересчёт на keyup открыл бы его снова.
 */
function handleKeyUp(event: KeyboardEvent): void {
	if (event.key === 'Escape') return
	checkAutocomplete()
}

function handleCancelReply(): void {
	emit('cancel-reply')
}

function handleQuickReply(reply: string): void {
	emit('quick-reply', reply)
}
</script>
