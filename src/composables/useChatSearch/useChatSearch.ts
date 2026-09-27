/** Composable: поиск по сообщениям чата */
import { computed, ref, watch } from 'vue'
import type { UseChatSearchOptions } from './useChatSearch.types'
import type { ChatMessage } from '@components/BaseChat/model/BaseChat.types'

/** Composable для поиска по сообщениям чата — строка запроса, флаг поиска, отфильтрованный список. */
function useChatSearch(options: UseChatSearchOptions) {
	const searchQuery = ref('')
	const isSearching = ref(false)

	const filteredMessages = computed((): ChatMessage[] => {
		if (!searchQuery.value) return options.getMessages()
		const query = searchQuery.value.toLowerCase()
		return options.getMessages().filter(message => message.text?.toLowerCase().includes(query))
	})

	// Закрытие поиска возвращает полную ленту: иначе лента оставалась бы отфильтрованной по запросу,
	// которого уже не видно, и новые сообщения, не подходящие под него, не отображались бы
	watch(isSearching, isActive => {
		if (!isActive) searchQuery.value = ''
	})

	return {
		searchQuery,
		isSearching,
		filteredMessages,
	}
}

export { useChatSearch }
