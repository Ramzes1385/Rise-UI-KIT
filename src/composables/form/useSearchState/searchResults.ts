/** Утилиты: отбор результатов поиска по запросу */
import { foldSearchText } from '@utils/data/textUtils'
import type { UseSearchStateOptions } from './types/useSearchState.types'
import type { SearchResult } from '@components/BaseSearch/types/BaseSearch.types'

function matchesQuery(item: SearchResult, lowerQuery: string): boolean {
	const matchTitle = foldSearchText(item.title).includes(lowerQuery)
	const matchDesc = Boolean(item.description && foldSearchText(item.description).includes(lowerQuery))
	return matchTitle || matchDesc
}

/** Описание: результаты для показа — по подстроке в заголовке или описании, не больше maxResults; пустой запрос — пусто */
function filterSearchResults(options: UseSearchStateOptions, query: string): SearchResult[] {
	if (!query) return []
	// Сервер ищет не только по подстроке (транслит, опечатки, другие поля) — повторная фильтрация скрыла бы его ответ
	if (options.isRemote?.()) return options.results().slice(0, options.maxResults())
	const lowerQuery = foldSearchText(query)
	return options
		.results()
		.filter(item => matchesQuery(item, lowerQuery))
		.slice(0, options.maxResults())
}

/** Описание: true — списки id совпадают поэлементно */
function isSameIdList(ids: SearchResult['id'][], previousIds: SearchResult['id'][]): boolean {
	return ids.length === previousIds.length && ids.every((id, index) => id === previousIds[index])
}

export { filterSearchResults, isSameIdList }
