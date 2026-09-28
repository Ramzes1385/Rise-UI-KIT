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

		<!-- Немодальная панель: Tab переходит от кнопки к эмодзи, Escape закрывает и возвращает фокус на кнопку -->
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
import { ref } from 'vue'
import { BaseIcon } from '@components/BaseIcon'
import { UI_CHAT_TEXT } from '@/locales/messages'
import { BaseButton } from '@components/BaseButton'
import { useClickOutside } from '@composables/useClickOutside'
import type { ChatEmojiPickerEmits, ChatEmojiPickerProps } from './ChatEmojiPicker.types'

defineProps<ChatEmojiPickerProps>()

const emit = defineEmits<ChatEmojiPickerEmits>()

const isEmojiOpen = ref(false)
const emojiWrapperRef = ref<HTMLElement | null>(null)
const triggerRef = ref<{ focus: () => void } | null>(null)

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

/** Escape закрывает панель; preventDefault — чтобы слой ниже (окно, панель с чатом) не закрылся тем же нажатием */
function handleEscape(event: KeyboardEvent): void {
	if (!isEmojiOpen.value) return
	event.preventDefault()
	isEmojiOpen.value = false
	triggerRef.value?.focus()
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
