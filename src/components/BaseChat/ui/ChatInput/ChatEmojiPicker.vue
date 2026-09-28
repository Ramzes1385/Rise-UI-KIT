<template>
	<div ref="emojiWrapperRef" class="base-chat-input__emoji-wrapper" @keydown.esc="handleEscape">
		<BaseButton
			ref="triggerRef"
			variant="ghost"
			:size-scale="sizeScale"
			class="base-chat-input__emoji-btn"
			:aria-label="UI_CHAT_TEXT.EMOJI_ARIA"
			aria-haspopup="dialog"
			:aria-expanded="isEmojiOpen ? 'true' : 'false'"
			@click="toggleEmoji">
			<BaseIcon name="smile" :size-scale="sizeScale" />
		</BaseButton>

		<div v-if="isEmojiOpen" class="base-chat-input__emoji-popover" role="dialog" :aria-label="UI_CHAT_TEXT.EMOJI_LIST">
			<div class="base-chat-input__emoji-list">
				<button
					v-for="emoji in popularEmojis"
					:key="emoji"
					type="button"
					class="base-chat-input__emoji-item"
					:aria-label="`${UI_CHAT_TEXT.INSERT_EMOJI} ${emoji}`"
					@click="selectEmoji(emoji)">
					{{ emoji }}
				</button>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { BaseIcon } from '@components/BaseIcon'
import { UI_CHAT_TEXT } from '@/locales/messages'
import { BaseButton } from '@components/BaseButton'
import { useChatEmojiPicker } from './model/useChatEmojiPicker'
import type { ChatEmojiPickerEmits, ChatEmojiPickerProps } from './types/ChatEmojiPicker.types'

defineProps<ChatEmojiPickerProps>()

const emit = defineEmits<ChatEmojiPickerEmits>()

const { isEmojiOpen, emojiWrapperRef, triggerRef, popularEmojis, toggleEmoji, selectEmoji, handleEscape } = useChatEmojiPicker(emit)
</script>
