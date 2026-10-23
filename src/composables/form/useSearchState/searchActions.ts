import { isImeKeydown } from '@utils/dom/keyboardUtils'
/** Утилиты: действия поиска — ввод, выбор, очистка, запуск по Enter */
import type { SearchResult } from '@components/BaseSearch/types/BaseSearch.types'
import type { SearchNavigation, SearchStateContext, UseSearchStateOptions } from './types/useSearchState.types'

/** Описание: закрывает модальное окно или боковую панель поиска; в обычном режиме ничего не делает */
function closeOverlayIfNeeded(options: UseSearchStateOptions): void {
	if (options.mode() === 'modal' || options.mode() === 'sidebar') options.closeOverlay()
}

/** Описание: выбирает результат — подставляет заголовок в запрос, сообщает о выборе и закрывает список */
function selectResult(ctx: SearchStateContext, item: SearchResult): void {
	ctx.debounce.cancel()
	ctx.query.value = item.title
	ctx.options.emit.select(item)
	ctx.options.emit.updateModelValue(item.title)
	ctx.isFocused.value = false
	closeOverlayIfNeeded(ctx.options)
}

/** Клавиши, которые двигают подсветку и выбирают пункт: при закрытом списке они ничего не выбирают */
const LIST_KEYS = new Set(['ArrowDown', 'ArrowUp', 'Enter'])

/**
 * Описание: стрелка при закрытом списке открывает его снова (APG combobox), Enter без списка не перехватывается — форма отправится.
 * Если открывать нечего (поиск по Enter ещё не запускали), стрелка не гасится: курсор в поле движется как обычно.
 */
function reopenList(ctx: SearchStateContext, e: KeyboardEvent): void {
	if (e.key === 'Enter' || ctx.query.value.length === 0) return
	ctx.isFocused.value = true
	if (ctx.options.isInstant() || ctx.isSearchTriggered.value) e.preventDefault()
}

/** Описание: обработчики ввода, клавиатуры, очистки и закрытия списка */
function createSearchHandlers(ctx: SearchStateContext, nav: SearchNavigation) {
	const { options, query } = ctx

	function handleInput(value: string): void {
		query.value = value
		ctx.isFocused.value = true
		options.emit.updateModelValue(value)
		ctx.isSearchTriggered.value = false
		// Новый запрос — прежняя подсветка не относится к нему; сразу, не дожидаясь пересчёта списка
		nav.reset()
		if (options.isInstant()) {
			ctx.debounce.schedule(value)
		}
	}

	function handleKeydown(e: KeyboardEvent): void {
		if (isImeKeydown(e)) return
		if (e.key === 'Enter' && nav.highlightedIndex.value < 0 && query.value) {
			e.preventDefault()
			ctx.debounce.cancel()
			ctx.isSearchTriggered.value = true
			options.emit.search(query.value)
			return
		}
		if (!ctx.isListShown.value && LIST_KEYS.has(e.key)) {
			reopenList(ctx, e)
			return
		}
		nav.handleKeydown(e)
	}

	function handleClear(): void {
		ctx.debounce.cancel()
		query.value = ''
		options.emit.updateModelValue('')
		options.emit.clear()
		options.focusActiveInput()
	}

	function handleClose(): void {
		ctx.isFocused.value = false
		nav.reset()
	}

	return { handleInput, handleKeydown, handleClear, handleClose }
}

export { closeOverlayIfNeeded, createSearchHandlers, selectResult }
