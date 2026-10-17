import type { Ref } from 'vue'

/** Направление: redo — вперёд (повтор), undo — назад (отмена) */
export type CommandHistoryDirection = 'undo' | 'redo'

/** Шаг истории: изменения вперёд и назад. Изменения — сериализуемые данные, применяет их предметная область */
export interface CommandHistoryEntry<C> {
	/** Подпись шага: «Соединение Orders → Kafka» — подсказка «Отменить» и озвучка */
	label: string
	/** Изменения вперёд */
	redo: C[]
	/** Изменения назад — уже обращённые, в порядке применения */
	undo: C[]
	/** Ключ склейки: подряд идущие шаги с одним ключом в пределах `mergeWindow` склеиваются (набор подписи, сдвиг стрелками) */
	mergeKey?: string
}

/** Строка списка «История изменений» */
export interface CommandHistoryItem {
	/** Подпись шага */
	label: string
	/** Когда записан, мс */
	time: number
	/** Отменён (лежит в стеке повтора) */
	isUndone: boolean
}

/** Состояние истории */
export interface CommandHistoryState {
	/** Можно отменить */
	canUndo: boolean
	/** Можно повторить */
	canRedo: boolean
	/** Подпись шага для отмены */
	undoLabel?: string
	/** Подпись шага для повтора */
	redoLabel?: string
}

/** Настройки истории */
export interface UseCommandHistoryOptions<C> {
	/** Применить изменения при отмене и повторе */
	apply: (changes: readonly C[], direction: CommandHistoryDirection) => void
	/** Глубина; по умолчанию 100 шагов */
	limit?: number
	/** Окно склейки, мс; по умолчанию 500 */
	mergeWindow?: number
}

/** История отмены */
export interface CommandHistory<C> {
	/** Записать выполненный шаг; внутри `transact` — в общий шаг */
	push: (entry: CommandHistoryEntry<C>) => void
	/** Шаги внутри `run` — одним шагом `label`; вложенные сливаются во внешний; `run` может вернуть Promise — шаг закроется после него */
	transact: <T>(label: string, run: () => T) => T
	/** Отменить; false — нечего */
	undo: () => boolean
	/** Повторить; false — нечего */
	redo: () => boolean
	/** Очистить */
	clear: () => void
	/** Шаги: отменяемые от старых к новым, затем отменённые */
	list: () => CommandHistoryItem[]
	/** Состояние — реактивно */
	state: Readonly<Ref<CommandHistoryState>>
}

/** Значение, которым обработчик хука может заменить исходное: всё, кроме «да/нет» */
export type HookValue<F> = F extends (context: never) => infer R ? Exclude<Awaited<R>, boolean | void> : never

/** Подписка на хук — для панели «Хуки» */
export interface HookSubscription {
	/** Id подписки */
	id: string
	/** Имя хука */
	name: string
	/** Имя функции-обработчика; анонимная — пустая строка */
	handler: string
	/** Приоритет */
	priority: number
	/** Включена */
	isEnabled: boolean
	/** Сколько раз вызвана */
	calls: number
}

/** Итог прогона хука */
export interface HookOutcome<V> {
	/** Обработчик вернул false */
	isCancelled: boolean
	/** Значение после замен обработчиков (или исходное) */
	value: V
}

/** Отменяемые хуки с приоритетом: обработчики по убыванию `priority`, первый false отменяет, объект заменяет значение для следующих */
export interface HookRunner<H extends { [K in keyof H]: (context: never) => unknown }> {
	/** Подписаться; возвращает отписку */
	on: <K extends keyof H>(name: K, handler: H[K], options?: { priority?: number }) => () => void
	/** Прогнать обработчики; синхронные идут без ожидания, Promise ждётся */
	run: <K extends keyof H>(name: K, context: Parameters<H[K]>[0], value: HookValue<H[K]>) => Promise<HookOutcome<HookValue<H[K]>>>
	/** Есть ли включённые обработчики */
	has: (name: keyof H) => boolean
	/** Подписки по убыванию приоритета; без имени — все */
	list: (name?: keyof H) => HookSubscription[]
	/** Включить или выключить подписку */
	setEnabled: (id: string, isEnabled: boolean) => void
}
