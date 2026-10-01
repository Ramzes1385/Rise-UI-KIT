import type { Ref } from 'vue'

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

/** Точка указателя в координатах окна (внутреннее устройство useSwipe) */
interface SwipePoint {
	x: number
	y: number
}

/** Смещение от начала жеста: по осям окна и вдоль (`main`) / поперёк (`cross`) направления свайпа */
interface SwipeDelta extends SwipePoint {
	main: number
	cross: number
}

/** Обновление смещения перетаскивания не чаще кадра */
interface SwipeOffsetScheduler {
	/** Запланировать кадр, если он ещё не запланирован; значение читается в момент кадра */
	schedule: (getOffset: () => number) => void
	/** Отменить запланированный кадр */
	cancel: () => void
}

/** Состояние жеста свайпа или перетаскивания */
interface SwipeDragSession {
	isDragging: Ref<boolean>
	dragOffset: Ref<number>
	/** Начало жеста в точке */
	begin: (point: SwipePoint) => void
	/** Смещение точки от начала жеста вдоль направления свайпа */
	offsetAt: (point: SwipePoint) => number
	/** Обновить смещение в следующем кадре */
	scheduleOffset: SwipeOffsetScheduler['schedule']
	/** Отменить запланированный кадр */
	cancel: () => void
	/** Отпускание в точке: onDragEnd, свайп по порогу, сброс смещения; возвращает дельту жеста */
	finish: (point: SwipePoint) => SwipeDelta
}

/** Подавление click, которым завершилось перетаскивание мышью */
interface SwipeClickGuard {
	/** Начало перетаскивания: прежний признак снимается */
	reset: () => void
	/** Отпускание: `wasDrag` — указатель ушёл дальше порога клика */
	mark: (wasDrag: boolean) => void
	/** Обработчик click в фазе захвата */
	onClickCapture: (event: MouseEvent) => void
}

/** Слушатели мыши на document на время перетаскивания */
interface SwipeMouseListeners {
	add: (handleMouseMove: (ev: MouseEvent) => void, handleMouseUp: (ev: MouseEvent) => void) => void
	remove: () => void
}

export type { SwipeClickGuard, SwipeDragSession, SwipeDelta, SwipeMouseListeners, SwipeOffsetScheduler, SwipePoint, UseSwipeOptions }
