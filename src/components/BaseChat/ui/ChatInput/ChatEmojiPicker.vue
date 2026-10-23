<template>
	<BasePopover
		v-model:is-open="isEmojiOpen"
		class="base-chat-input__emoji-wrapper"
		position="top"
		variant="ghost"
		max-height="none"
		:size-scale="sizeScale"
		:aria-label="UI_CHAT_TEXT.EMOJI_LIST"
		:ui="{ inner: 'base-chat-input__emoji-popover' }">
		<template #trigger>
			<BaseButton
				ref="triggerRef"
				variant="ghost"
				:size-scale="sizeScale"
				class="base-chat-input__emoji-btn"
				:aria-label="UI_CHAT_TEXT.EMOJI_ARIA">
				<BaseIcon name="smile" :size-scale="sizeScale" />
			</BaseButton>
		</template>

		<div ref="popoverRef">
			<BaseEmojiPicker
				v-model:recent="recentEmojis"
				variant="ghost"
				:size-scale="sizeScale"
				:has-preview="false"
				class="base-chat-input__emoji-picker"
				@select="selectEmoji" />
		</div>
	</BasePopover>
</template>

<script setup lang="ts">
import { BaseIcon } from '@components/BaseIcon'
import { UI_CHAT_TEXT } from '@/locales/messages'
import { BaseButton } from '@components/BaseButton'
import { BasePopover } from '@components/BasePopover'
import { BaseEmojiPicker } from '@components/BaseEmojiPicker'
import { useChatEmojiPicker } from './model/useChatEmojiPicker'
import type { ChatEmojiPickerEmits, ChatEmojiPickerProps } from './types/ChatEmojiPicker.types'

defineProps<ChatEmojiPickerProps>()

const emit = defineEmits<ChatEmojiPickerEmits>()

const { isEmojiOpen, triggerRef, popoverRef, recentEmojis, selectEmoji } = useChatEmojiPicker(emit)
</script>
