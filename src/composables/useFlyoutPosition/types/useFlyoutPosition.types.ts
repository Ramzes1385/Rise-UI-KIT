import type { Ref } from 'vue'

/**
 * Опции composable useFlyoutPosition
 */
export interface UseFlyoutPositionOptions {
	/** Ref на якорь (шапку узла) — задаёт вертикальное выравнивание панели */
	anchorRef: Ref<HTMLElement | null>
	/** Ref на саму flyout-панель */
	panelRef: Ref<HTMLElement | null>
	/** Открыта ли панель */
	isOpen: () => boolean
	/**
	 * Граница для горизонтального расчёта (панель-контейнер узла).
	 * Если задана — flyout встаёт встык к её краю, а не к узкой шапке узла
	 * (иначе панель из-за padding контейнера наезжала бы на него).
	 * По умолчанию используется anchorRef.
	 */
	boundaryRef?: Ref<HTMLElement | null>
	/** Горизонтальный отступ панели от границы (px) */
	gap?: number
	/** Минимальная ширина панели для расчёта flip (px) */
	minWidth?: number
}

/**
 * Результат composable useFlyoutPosition
 */
export interface UseFlyoutPositionReturn {
	/** Готовые fixed-стили панели (top/left + width) */
	panelStyle: Readonly<Ref<Record<string, string>>>
	/** Раскрыта ли панель влево (не хватило места справа) */
	isFlipped: Readonly<Ref<boolean>>
	/** Принудительно пересчитать позицию */
	updatePosition: () => void
}
