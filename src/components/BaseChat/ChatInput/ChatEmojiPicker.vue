<template>
	<div ref="emojiWrapperRef" class="base-chat-input__emoji-wrapper">
		<BaseButton
			variant="ghost"
			:padding="2"
			:size-scale="sizeScale"
			class="base-chat-input__emoji-btn"
			:aria-label="UI_CHAT_EMOJI_ARIA"
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
					:aria-label="`${UI_CHAT_INSERT_EMOJI} ${emoji}`"
					@click="selectEmoji(emoji)">
					{{ emoji }}
				</BaseButton>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { BaseButton } from '@components/BaseButton'
import { BaseIcon } from '@components/BaseIcon'
import { useClickOutside } from '@composables/useClickOutside'
import { UI_CHAT_EMOJI_ARIA, UI_CHAT_INSERT_EMOJI } from '@constants'
import type { ChatEmojiPickerEmits, ChatEmojiPickerProps } from './ChatEmojiPicker.types'

defineProps<ChatEmojiPickerProps>()

const emit = defineEmits<ChatEmojiPickerEmits>()

const isEmojiOpen = ref(false)
const emojiWrapperRef = ref<HTMLElement | null>(null)

useClickOutside({
	targets: [emojiWrapperRef],
	callback: () => {
		isEmojiOpen.value = false
	},
	isActive: () => isEmojiOpen.value,
})

function toggleEmoji(): void {
	isEmojiOpen.value = !isEmojiOpen.value
}

function selectEmoji(emoji: string): void {
	emit('select', emoji)
	isEmojiOpen.value = false
}

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
</script>
