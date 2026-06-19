import { computed, ref } from 'vue'
import type { UseChatSearchOptions } from './useChatSearch.types'
import type { ChatMessage } from '@components/BaseChat/model/BaseChat.types'

function useChatSearch(options: UseChatSearchOptions) {
	const searchQuery = ref('')
	const isSearching = ref(false)

	const filteredMessages = computed((): ChatMessage[] => {
		if (!searchQuery.value) return options.getMessages()
		const query = searchQuery.value.toLowerCase()
		return options.getMessages().filter(message => message.text?.toLowerCase().includes(query))
	})

	return {
		searchQuery,
		isSearching,
		filteredMessages,
	}
}

export { useChatSearch }
