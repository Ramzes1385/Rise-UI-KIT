import type { ComputedRef, Ref } from 'vue'
import type { SearchMode, SearchResult } from '@components/BaseSearch/types/BaseSearch.types'

export interface UseSearchStateOptions {
	modelValue: () => string
	mode: () => SearchMode
	results: () => SearchResult[]
	/** Результаты уже отфильтрованы сервером — не фильтровать их по подстроке на клиенте */
	isRemote?: () => boolean
	isInstant: () => boolean
	debounceMs: () => number
	maxResults: () => number
	isAutofocus: () => boolean
	emit: {
		search: (query: string) => void
		select: (item: SearchResult) => void
		updateModelValue: (value: string) => void
		clear: () => void
	}
	focusActiveInput: () => void
	closeOverlay: () => void
	/** Внешняя смена `modelValue` (не ввод пользователя): идущий запрос источника отменяется */
	onExternalChange?: () => void
}

/** Отложенный запуск поиска при мгновенном режиме */
export interface SearchDebounce {
	/** Запускает поиск через debounceMs; прежний отложенный запуск отменяется */
	schedule: (value: string) => void
	/** Отменяет отложенный запуск */
	cancel: () => void
}

/** Навигация по списку результатов (часть возврата useListNavigation, которой пользуется поиск) */
export interface SearchNavigation {
	highlightedIndex: Ref<number>
	handleKeydown: (e: KeyboardEvent) => void
	reset: () => void
}

/** Внутреннее состояние useSearchState, общее для действий поиска */
export interface SearchStateContext {
	options: UseSearchStateOptions
	query: Ref<string>
	isFocused: Ref<boolean>
	/** Список результатов показан: стрелки и Enter выбирают пункты только пока он виден */
	isListShown: ComputedRef<boolean>
	/** Поиск запущен по Enter (для режима без мгновенного поиска) */
	isSearchTriggered: Ref<boolean>
	debounce: SearchDebounce
}
