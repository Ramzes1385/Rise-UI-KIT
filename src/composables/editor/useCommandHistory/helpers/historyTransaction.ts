/** Утилиты: группировка шагов истории в `transact` — вложенные и асинхронные */
import { combineEntries } from './historyStacks'
import type { HistoryTransaction } from '../types/historyInternal.types'
import type { CommandHistoryEntry } from '../types/useCommandHistory.types'

function isPromiseLike(value: unknown): value is PromiseLike<unknown> {
	return typeof (value as PromiseLike<unknown> | null)?.then === 'function'
}

/** Запись шагов: вне `transact` — сразу в историю, внутри — в общий шаг */
export function createTransactor<C>(record: (entry: CommandHistoryEntry<C>) => void) {
	let transaction: HistoryTransaction<C> | null = null

	function close(current: HistoryTransaction<C>): void {
		current.depth -= 1
		if (current.depth > 0) return
		transaction = null
		if (current.entries.length > 0) record(combineEntries(current.label, current.entries))
	}

	function push(entry: CommandHistoryEntry<C>): void {
		if (transaction) transaction.entries.push(entry)
		else record(entry)
	}

	function transact<T>(label: string, run: () => T): T {
		const current = (transaction ??= { label, entries: [], depth: 0 })
		current.depth += 1
		let result: T
		try {
			result = run()
		} catch (error) {
			close(current)
			throw error
		}
		if (!isPromiseLike(result)) {
			close(current)
			return result
		}
		const settle = <V>(value: V): V => {
			close(current)
			return value
		}
		const fail = (error: unknown): never => {
			close(current)
			throw error
		}
		return result.then(settle, fail) as T
	}

	return { push, transact }
}
