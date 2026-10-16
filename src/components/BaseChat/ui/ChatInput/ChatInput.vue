<template>
	<div class="base-chat-input">
		<div v-if="quickReplies && quickReplies.length > 0" class="base-chat-input__quick-replies">
			<BaseButton
				v-for="reply in quickReplies"
				:key="reply"
				variant="outline"
				:size-scale="sizeScale * quickReplyScale"
				class="base-chat-input__quick-reply-btn"
				:aria-label="formatMessage(UI_CHAT_TEXT.QUICK_REPLY_NAMED, { reply })"
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

		<div v-if="editingMessage" class="base-chat-input__reply-bar base-chat-input__edit-bar">
			<BaseIcon name="edit" :size-scale="sizeScale * CHAT_SCALE.SMALL" class="base-chat-input__reply-icon" />
			<div class="base-chat-input__reply-content">
				<span class="base-chat-input__reply-sender">{{ UI_CHAT_TEXT.EDITING }}</span>
				<span class="base-chat-input__reply-text">{{ editingMessage.text }}</span>
			</div>
			<BaseButton
				variant="ghost"
				:size-scale="sizeScale"
				class="base-chat-input__reply-cancel"
				:aria-label="UI_CHAT_TEXT.CANCEL_EDIT_ARIA"
				@click="handleCancelEdit">
				<BaseIcon name="close" :size-scale="sizeScale * CHAT_SCALE.SMALL" />
			</BaseButton>
		</div>

		<div v-if="attachmentErrors.length > 0" class="base-chat-input__errors" role="alert">
			<BaseIcon name="alert-triangle" :size-scale="sizeScale * CHAT_SCALE.SMALL" class="base-chat-input__errors-icon" />
			<ul class="base-chat-input__errors-list">
				<li v-for="message in attachmentErrors" :key="message">{{ message }}</li>
			</ul>
			<BaseButton
				variant="ghost"
				:size-scale="sizeScale"
				class="base-chat-input__errors-close"
				:aria-label="UI_CHAT_TEXT.ATTACH_ERROR_CLOSE"
				@click="dismissAttachmentErrors">
				<BaseIcon name="close" :size-scale="sizeScale * CHAT_SCALE.SMALL" />
			</BaseButton>
		</div>

		<ChatFilePreview v-if="attachments.length > 0" :attachments="attachments" :size-scale="sizeScale" @remove="removeAttachment" />

		<div v-if="isVoiceMode" class="base-chat-input__controls base-chat-input__controls--voice">
			<BaseVoiceRecorder
				ref="recorderRef"
				class="base-chat-input__recorder"
				variant="soft"
				:size-scale="sizeScale"
				:request-stream="requestVoiceStream"
				@record="handleVoiceRecord"
				@state-change="handleVoiceState" />
			<BaseButton
				v-if="voiceState === 'error'"
				variant="ghost"
				:size-scale="sizeScale"
				:aria-label="UI_ARIA.CLOSE"
				@click="closeVoice">
				<BaseIcon name="close" :size-scale="sizeScale" />
			</BaseButton>
		</div>

		<div v-else class="base-chat-input__controls">
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
				:accept="accept"
				class="base-chat-input__file-input"
				tabindex="-1"
				:aria-label="UI_CHAT_TEXT.FILE_SELECT_ARIA"
				@change="handleFileChange" />

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
				v-if="canRecordVoice"
				:size-scale="sizeScale"
				class="base-chat-input__send-btn"
				:aria-label="UI_AUDIO.RECORD"
				@click="startVoice">
				<BaseIcon name="mic" :size-scale="sizeScale" />
			</BaseButton>
			<BaseButton
				v-else
				:size-scale="sizeScale"
				:is-disabled="!text.trim() && attachments.length === 0"
				class="base-chat-input__send-btn"
				:aria-label="editingMessage ? UI_CHAT_TEXT.SAVE_EDIT_ARIA : UI_CHAT_TEXT.SEND_ARIA"
				@click="handleSend">
				<BaseIcon :name="editingMessage ? 'check' : 'send'" :size-scale="sizeScale" />
			</BaseButton>
		</div>
	</div>
</template>

<script setup lang="ts">
import '@components/BaseImage/styles/BaseImage.style.scss'
import './ChatInput.style.scss'
import { formatMessage } from '@/locales/state'
import { BaseIcon } from '@components/BaseIcon'
import { CHAT_SCALE } from '../../model/chatScale'
import ChatEmojiPicker from './ChatEmojiPicker.vue'
import ChatFilePreview from './ChatFilePreview.vue'
import { useChatInput } from './model/useChatInput'
import { BaseAvatar } from '@components/BaseAvatar'
import { BaseButton } from '@components/BaseButton'
import { BaseVoiceRecorder } from '@components/BaseVoiceRecorder'
import { UI_ARIA, UI_AUDIO, UI_CHAT_TEXT } from '@/locales/messages'
import { SIZE_SCALE_DEFAULT } from '@composables/base/useBaseComponent'
import type { ChatInputEmits, ChatInputProps } from './types/ChatInput.types'

const props = withDefaults(defineProps<ChatInputProps>(), {
	sizeScale: SIZE_SCALE_DEFAULT,
	replyingTo: null,
	editingMessage: null,
	quickReplies: () => [],
	members: () => [],
	commands: () => [],
})

const emit = defineEmits<ChatInputEmits>()

const {
	text,
	fileInputRef,
	attachments,
	attachmentErrors,
	dismissAttachmentErrors,
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
	quickReplyScale,
	suggestionsId,
	isSuggestionsOpen,
	setTextareaRef,
	handleKeyUp,
	handleCancelReply,
	handleCancelEdit,
	handleQuickReply,
	isVoiceMode,
	voiceState,
	recorderRef,
	canRecordVoice,
	startVoice,
	closeVoice,
	handleVoiceState,
	handleVoiceRecord,
} = useChatInput(props, emit)
</script>
