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
				:aria-label="`${UI_CHAT_TEXT.QUICK_REPLY} ${reply}`"
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
						{{ replyingTo.senderName || UI_CHAT_TEXT.MESSAGE_PLACEHOLDER }}
					</BaseText>
					<BaseText tag="p" :size-scale="sizeScale * UI_CHAT_SCALE.ICON" class="base-chat-input__reply-text">
						{{ replyingTo.text }}
					</BaseText>
				</div>
			</div>
			<BaseButton
				variant="ghost"
				:padding="1"
				:size-scale="sizeScale * UI_SCALE.SMALL"
				class="base-chat-input__reply-cancel"
				:aria-label="UI_CHAT_TEXT.CANCEL_REPLY_ARIA"
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
				:aria-label="UI_CHAT_TEXT.ATTACH_ARIA"
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
				:aria-label="UI_CHAT_TEXT.FILE_SELECT_ARIA"
				@change="handleFileChange" />

			<!-- Кнопка команд (как в Telegram) — появляется только если есть команды -->
			<BaseButton
				v-if="hasCommands"
				variant="ghost"
				:padding="2"
				:size-scale="sizeScale"
				class="base-chat-input__commands-btn"
				:class="{ 'base-chat-input__commands-btn--active': showCommands }"
				:aria-label="UI_CHAT_TEXT.SHOW_COMMANDS_ARIA"
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
						<BaseAvatar :src="member.avatar" :name="member.name" :size-scale="sizeScale * UI_CHAT_SCALE.STATUS" />
						<div class="base-chat-input__autocomplete-info">
							<BaseText :size-scale="sizeScale * UI_SCALE.AUTOCOMPLETE" :weight="UI_FONT_WEIGHT.SEMIBOLD">{{ member.name }}</BaseText>
							<BaseText v-if="member.role" :size-scale="sizeScale * UI_CHAT_SCALE.META" class="base-chat-input__autocomplete-sub">
								{{ member.role === 'admin' ? UI_CHAT_TEXT.ADMIN : UI_CHAT_TEXT.MEMBER }}
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
						<BaseIcon name="file-config" :size-scale="sizeScale * UI_CHAT_SCALE.ICON" class="base-chat-input__autocomplete-icon" />
						<div class="base-chat-input__autocomplete-info">
							<BaseText :size-scale="sizeScale * UI_SCALE.AUTOCOMPLETE" :weight="UI_FONT_WEIGHT.SEMIBOLD">/{{ command.name }}</BaseText>
							<BaseText :size-scale="sizeScale * UI_CHAT_SCALE.META" class="base-chat-input__autocomplete-sub">
								{{ command.description }}
							</BaseText>
						</div>
					</div>
				</div>

				<BaseInput
					ref="inputComponentRef"
					v-model="text"
					:placeholder="UI_CHAT_TEXT.MESSAGE_INPUT"
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
					:aria-label="UI_CHAT_TEXT.SEND_ARIA"
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
import { BaseInput } from '@components/BaseInput'
import { BaseText } from '@components/BaseText'
import { useChatInputState } from '@composables/useChatInputState'
import {
	UI_CHAT_SCALE,
	UI_CHAT_TEXT,
	UI_FONT_WEIGHT,
	UI_SCALE,
	SIZE_SCALE_DEFAULT,
} from '@constants'
import ChatEmojiPicker from './ChatEmojiPicker.vue'
import ChatFilePreview from './ChatFilePreview.vue'
import './ChatInput.style.scss'
import type { ChatInputEmits, ChatInputProps } from './ChatInput.types'

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

function handleCancelReply(): void {
	emit('cancel-reply')
}

function handleQuickReply(reply: string): void {
	emit('quick-reply', reply)
}
</script>
