import { nextTick, ref, watch } from 'vue'
import type { EmojiPickerItem } from '@components/BaseEmojiPicker'
import { useClickOutside } from '@composables/overlay/useClickOutside'
import type { ChatEmojiPickerEmits } from '../types/ChatEmojiPicker.types'

export function useChatEmojiPicker(emit: ChatEmojiPickerEmits) {
	const isEmojiOpen = ref(false)
	const recentEmojis = ref<string[]>([])
	const emojiWrapperRef = ref<HTMLElement | null>(null)
	const popoverRef = ref<HTMLElement | null>(null)
	const triggerRef = ref<{ focus: () => void } | null>(null)
	useClickOutside({
		targets: [emojiWrapperRef],
		callback: () => {
			isEmojiOpen.value = false
		},
		isActive: () => isEmojiOpen.value,
	})
	watch(isEmojiOpen, isOpen => {
		if (isOpen) nextTick(() => popoverRef.value?.querySelector<HTMLElement>('input, [tabindex="0"]')?.focus())
	})

	return {
		isEmojiOpen,
		recentEmojis,
		emojiWrapperRef,
		popoverRef,
		triggerRef,
		toggleEmoji(): void {
			isEmojiOpen.value = !isEmojiOpen.value
		},
		selectEmoji(item: EmojiPickerItem): void {
			isEmojiOpen.value = false
			emit('select', item.emoji)
		},
		handleEscape(event: KeyboardEvent): void {
			if (!isEmojiOpen.value) return
			event.preventDefault()
			isEmojiOpen.value = false
			triggerRef.value?.focus()
		},
	}
}
