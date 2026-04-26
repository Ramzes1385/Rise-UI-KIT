import type { Ref } from 'vue'

/**
 * Опции composable useAutoScroll
 */
export interface UseAutoScrollOptions {
	/** Ref на контейнер для прокрутки */
	container: Ref<HTMLElement | null>
	/** Включена ли автопрокрутка */
	enabled: () => boolean
	/** Источник данных для отслеживания изменений (длина массива и т.д.) */
	watchSource: () => unknown
}
