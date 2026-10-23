/** Значение атрибута; `undefined` — атрибута нет */
export type TriggerAttributes = Record<string, string | undefined>

/** Опции composable useTriggerAttributes */
export interface UseTriggerAttributesOptions {
	/** Триггеру нужен id: без своего id элемент получает сгенерированный */
	withId?: boolean
	/**
	 * Атрибуты для триггера без фокусируемого элемента в слоте (первый дочерний элемент — `span`, `div`),
	 * например `{ role: 'button', tabindex: '0' }`: так триггер получает фокус с клавиатуры
	 */
	fallbackAttributes?: TriggerAttributes
}
