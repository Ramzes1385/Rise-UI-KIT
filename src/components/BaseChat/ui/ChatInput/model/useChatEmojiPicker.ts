import { nextTick, ref, watch } from 'vue'
import type { EmojiPickerItem } from '@components/BaseEmojiPicker'
import type { ChatEmojiPickerEmits } from '../types/ChatEmojiPicker.types'

export function useChatEmojiPicker(emit: ChatEmojiPickerEmits) {
	const isEmojiOpen = ref(false)
	const recentEmojis = ref<string[]>([])
	const popoverRef = ref<HTMLElement | null>(null)
	const triggerRef = ref<{ focus: () => void } | null>(null)
	watch(isEmojiOpen, isOpen => {
		if (isOpen) nextTick(() => popoverRef.value?.querySelector<HTMLElement>('input, [tabindex="0"]')?.focus())
	})

	return {
		isEmojiOpen,
		recentEmojis,
		popoverRef,
		triggerRef,
		selectEmoji(item: EmojiPickerItem): void {
			isEmojiOpen.value = false
			emit('select', item.emoji)
		},
	}
}
