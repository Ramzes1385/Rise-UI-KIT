/** Composable: история отмены по командам — шаги «вперёд/назад» как данные, применяет их предметная область */
import { createHistoryStore } from './helpers/historyStore'
import { createTransactor } from './helpers/historyTransaction'
import type { CommandHistory, UseCommandHistoryOptions } from './types/useCommandHistory.types'

const DEFAULT_LIMIT = 100
const DEFAULT_MERGE_WINDOW = 500

/** История отмены: `push` записывает шаг, `transact` собирает несколько шагов в один, `undo` и `redo` зовут `apply` */
export function useCommandHistory<C>(options: UseCommandHistoryOptions<C>): CommandHistory<C> {
	const store = createHistoryStore<C>(options.limit ?? DEFAULT_LIMIT, options.mergeWindow ?? DEFAULT_MERGE_WINDOW)
	const { push, transact } = createTransactor<C>(store.record)
	return {
		push,
		transact,
		undo: () => store.step('undo', options.apply),
		redo: () => store.step('redo', options.apply),
		clear: store.clear,
		list: store.list,
		state: store.state,
	}
}
