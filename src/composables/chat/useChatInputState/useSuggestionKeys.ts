/** Composable: клавиатура в списке подсказок поля ввода чата (стрелки, Enter, Escape) */
import { getNextSuggestionIndex } from './chatInputText'
import type { ChatSuggestionKeysSource, SuggestionList } from './types/useChatInputState.types'

/**
 * Обработчик клавиш для открытого списка подсказок. Enter выбирает активный пункт (APG combobox) и сообщение не отправляет:
 * отправка — следующим Enter, когда список закрыт.
 */
function useSuggestionKeys(suggestions: ChatSuggestionKeysSource) {
	const { showMentions, showCommands, activeSuggestionIndex, filteredMembers, filteredCommands, replaceCurrentWord } = suggestions

	/** Индекс активного пункта в пределах списка: список мог сократиться раньше, чем сработало ужатие индекса */
	const clampedIndex = (list: SuggestionList): number => Math.min(activeSuggestionIndex.value, list.items.length - 1)

	function pickSuggestion(list: SuggestionList): void {
		replaceCurrentWord(list.prefix, list.items[clampedIndex(list)]!.name)
	}

	/** Стрелки, Enter и Escape в списке подсказок; true — клавиша обработана */
	function handleSuggestionNavigation(event: KeyboardEvent, list: SuggestionList): boolean {
		if (list.items.length === 0) return false
		const nextIndex = getNextSuggestionIndex(event.key, clampedIndex(list), list.items.length)
		if (nextIndex !== null) {
			event.preventDefault()
			activeSuggestionIndex.value = nextIndex
			return true
		}
		if (event.key !== 'Enter' && event.key !== 'Escape') return false
		event.preventDefault()
		if (event.key === 'Enter') pickSuggestion(list)
		else list.isShown.value = false
		return true
	}

	/** Клавиша в открытом списке участников или команд; true — клавиша обработана */
	function handleSuggestionKey(event: KeyboardEvent): boolean {
		if (showMentions.value && handleSuggestionNavigation(event, { items: filteredMembers.value, prefix: '@', isShown: showMentions }))
			return true
		return (
			showCommands.value && handleSuggestionNavigation(event, { items: filteredCommands.value, prefix: '/', isShown: showCommands })
		)
	}

	return { handleSuggestionKey }
}

export { useSuggestionKeys }
