import type { Ref } from 'vue'
import type { CommandHistoryDirection, CommandHistoryEntry, CommandHistoryItem, CommandHistoryState } from './useCommandHistory.types'

/** Шаг в стеке: запись и время, когда она сделана */
export interface StackEntry<C> {
	/** Запись шага */
	entry: CommandHistoryEntry<C>
	/** Время записи, мс */
	time: number
}

/** Хранилище стеков отмены и повтора */
export interface HistoryStore<C> {
	/** Записать шаг со склейкой и обрезкой по глубине */
	record: (entry: CommandHistoryEntry<C>) => void
	/** Отменить или повторить: false — стек пуст */
	step: (direction: CommandHistoryDirection, apply: (changes: readonly C[], direction: CommandHistoryDirection) => void) => boolean
	/** Очистить оба стека */
	clear: () => void
	/** Список шагов */
	list: () => CommandHistoryItem[]
	/** Состояние */
	state: Readonly<Ref<CommandHistoryState>>
}

/** Открытая группа шагов `transact` */
export interface HistoryTransaction<C> {
	/** Подпись общего шага */
	label: string
	/** Собранные шаги */
	entries: CommandHistoryEntry<C>[]
	/** Глубина вложенности */
	depth: number
}

/** Условия склейки шага с верхним шагом стека */
export interface MergeCheck<C> {
	/** Верхний шаг */
	top: StackEntry<C> | undefined
	/** Новый шаг */
	entry: CommandHistoryEntry<C>
	/** Сейчас, мс */
	now: number
	/** Окно склейки, мс */
	window: number
}

/** Подписка внутри раннера хуков */
export interface HookEntry {
	/** Id */
	id: string
	/** Имя хука */
	name: string
	/** Обработчик */
	handler: (context: unknown) => unknown
	/** Приоритет */
	priority: number
	/** Включена */
	isEnabled: boolean
	/** Вызовов */
	calls: number
}

/** Хуки произвольной формы: имя → функция с одним контекстом */
export type AnyHooks<H> = { [K in keyof H]: (context: never) => unknown }
