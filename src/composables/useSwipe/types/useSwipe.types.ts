/** Параметры composable useSwipe */
interface UseSwipeOptions {
	/** Вертикальный режим */
	isVertical: () => boolean
	/** Порог срабатывания свайпа в пикселях */
	threshold?: number
	/** Callback при свайпе вперёд (влево/вверх) */
	onSwipeNext?: () => void
	/** Callback при свайпе назад (вправо/вниз) */
	onSwipePrev?: () => void
	/** Callback при обновлении смещения перетаскивания */
	onDragOffset?: (offset: number) => void
	/** Callback при отпускании перетаскивания с дельтой для snap-решения */
	onDragEnd?: (delta: { main: number; cross: number }) => void
}

export type { UseSwipeOptions }
