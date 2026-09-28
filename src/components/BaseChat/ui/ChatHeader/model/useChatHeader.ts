import { UI_CHAT_TEXT } from '@/locales/messages'
import { computed, nextTick, ref, watch } from 'vue'
import type { ChatHeaderEmits, ChatHeaderProps } from '../types/ChatHeader.types'

export function useChatHeader(props: ChatHeaderProps, emit: ChatHeaderEmits) {
	const searchInputRef = ref<HTMLInputElement | null>(null)
	const searchToggleRef = ref<{ focus: () => void } | null>(null)

	watch(
		() => props.isSearching,
		isSearching => {
			if (isSearching) nextTick(() => searchInputRef.value?.focus())
		},
	)

	return {
		searchInputRef,
		searchToggleRef,
		typingText: computed(() =>
			props.typingUsername ? `${props.typingUsername} ${UI_CHAT_TEXT.TYPING_SUFFIX}` : UI_CHAT_TEXT.TYPING_LABEL,
		),
		handleAvatarClick: (): void => emit('avatar-click'),
		handleToggleSearch: (): void => emit('toggle-search'),
		handleSearchInput: (event: Event): void => emit('update:searchQuery', (event.target as HTMLInputElement).value),
		handleSearchEscape(): void {
			emit('toggle-search')
			nextTick(() => searchToggleRef.value?.focus())
		},
		handleInfoClick: (): void => emit('info-click'),
	}
}
