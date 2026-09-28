import { UI_CHAT_TEXT } from '@/locales/messages'
/** Composable: логика ChatHeader — строка «печатает», поле поиска и возврат фокуса на кнопку поиска */
import { computed, nextTick, ref, watch } from 'vue'
import type { ChatHeaderEmits, ChatHeaderProps } from '../types/ChatHeader.types'

export function useChatHeader(props: ChatHeaderProps, emit: ChatHeaderEmits) {
	const searchInputRef = ref<HTMLInputElement | null>(null)
	const searchToggleRef = ref<{ focus: () => void } | null>(null)

	// Открытое поле поиска сразу получает фокус: можно печатать без лишнего клика
	watch(
		() => props.isSearching,
		isSearching => {
			if (isSearching) nextTick(() => searchInputRef.value?.focus())
		},
	)

	return {
		searchInputRef,
		searchToggleRef,
		// «Анна печатает» в групповом чате, «Печатает» — в личном
		typingText: computed(() =>
			props.typingUsername ? `${props.typingUsername} ${UI_CHAT_TEXT.TYPING_SUFFIX}` : UI_CHAT_TEXT.TYPING_LABEL,
		),
		handleAvatarClick: (): void => emit('avatar-click'),
		handleToggleSearch: (): void => emit('toggle-search'),
		handleSearchInput: (event: Event): void => emit('update:searchQuery', (event.target as HTMLInputElement).value),
		/** Escape в поле поиска закрывает поиск и возвращает фокус на кнопку поиска */
		handleSearchEscape(): void {
			emit('toggle-search')
			nextTick(() => searchToggleRef.value?.focus())
		},
		handleInfoClick: (): void => emit('info-click'),
	}
}
