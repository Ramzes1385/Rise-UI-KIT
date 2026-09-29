import { ref } from 'vue'
import { useClickOutside } from '@composables/overlay/useClickOutside'
import type { ChatEmojiPickerEmits } from '../types/ChatEmojiPicker.types'

const POPULAR_EMOJIS = [
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

export function useChatEmojiPicker(emit: ChatEmojiPickerEmits) {
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

	return {
		isEmojiOpen,
		emojiWrapperRef,
		triggerRef,
		popularEmojis: POPULAR_EMOJIS,
		toggleEmoji(): void {
			isEmojiOpen.value = !isEmojiOpen.value
		},
		selectEmoji(emoji: string): void {
			emit('select', emoji)
			isEmojiOpen.value = false
		},
		handleEscape(event: KeyboardEvent): void {
			if (!isEmojiOpen.value) return
			event.preventDefault()
			isEmojiOpen.value = false
			triggerRef.value?.focus()
		},
	}
}
