import type { Ref } from 'vue'

export interface UseAutoScrollOptions {
	/** Ref на контейнер для прокрутки */
	container: Ref<HTMLElement | null>
	/** Включена ли автопрокрутка */
	enabled: () => boolean
	/** Источник данных для отслеживания изменений (длина массива и т.д.) */
	watchSource: () => unknown
	/**
	 * Плавная ли эта прокрутка; читается в момент прокрутки (после отрисовки). По умолчанию — `true`.
	 * `false` — сразу к низу (например, подгрузка истории или смена фильтра). Выключенное движение прокручивает сразу всегда
	 */
	isSmooth?: () => boolean
}
