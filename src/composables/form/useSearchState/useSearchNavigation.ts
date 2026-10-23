/** Composable: навигация с клавиатуры по результатам поиска */
import { watch } from 'vue'
import type { ComputedRef } from 'vue'
import { isSameIdList } from './searchResults'
import { closeOverlayIfNeeded, selectResult } from './searchActions'
import { useListNavigation } from '@composables/interaction/useListNavigation'
import type { SearchResult } from '@components/BaseSearch/types/BaseSearch.types'
import type { SearchNavigation, SearchStateContext } from './types/useSearchState.types'

/** Описание: подсветка, выбор по Enter и Escape для списка результатов; подсветка сбрасывается при смене набора результатов */
function useSearchNavigation(ctx: SearchStateContext, visibleResults: ComputedRef<SearchResult[]>): SearchNavigation {
	const nav = useListNavigation({
		itemCount: () => visibleResults.value.length,
		// Индекс за концом списка (список сократился между пересчётом и нажатием Enter) useListNavigation не выбирает
		onSelect: index => selectResult(ctx, visibleResults.value[index]),
		onEscape: () => closeOverlayIfNeeded(ctx.options),
	})

	/**
	 * Подсветка хранится индексом: при смене набора результатов (новый запрос, ответ сервера)
	 * он указывает на другой или уже отсутствующий элемент — сбрасываем, чтобы Enter
	 * не выбрал то, что пользователь не подсвечивал, и не упал на несуществующем индексе.
	 */
	watch(
		() => visibleResults.value.map(item => item.id),
		(ids, previousIds) => {
			if (!isSameIdList(ids, previousIds)) nav.reset()
		},
	)

	return nav
}

export { useSearchNavigation }
