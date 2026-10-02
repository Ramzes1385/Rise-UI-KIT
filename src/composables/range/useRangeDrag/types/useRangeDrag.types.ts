import type { ref } from 'vue'

export interface UseRangeDragOptions {
	trackRef: { value: HTMLElement | null }
	pointValues: { value: number[] }
	isDisabled: () => boolean
	min: () => number
	max: () => number
	step: () => number
	isVertical: () => boolean
	thumbMin: (index: number) => number
	thumbMax: (index: number) => number
	snapToStepValue: (value: number) => number
	setPointValue: (index: number, rawValue: number) => void
	/** Эмитить change; values — значения точек после изменения (по умолчанию — текущие props) */
	emitChange: (values?: number[]) => void
}

export interface UseRangeDragReturn {
	activeIndex: ReturnType<typeof ref<number | null>>
	handleThumbDown: (payload: { event: MouseEvent | TouchEvent; index: number }) => void
	handleTrackDown: (e: MouseEvent) => void
	handleThumbKeydown: (payload: { event: KeyboardEvent; index: number }) => void
}

/** Способ перетаскивания: мышь или касание — у каждого свои события документа */
export type RangeDragKind = 'mouse' | 'touch'

/** Подписки документа на время перетаскивания ползунка (useRangeDragListeners) */
export interface UseRangeDragListenersOptions {
	/** Индекс перетаскиваемого ползунка; null — перетаскивания нет */
	activeIndex: { value: number | null }
	/** Движение указателя при активном перетаскивании */
	onMove: (index: number, event: MouseEvent | TouchEvent) => void
	/** Конец перетаскивания (отпускание кнопки или пальца) */
	onEnd: () => void
}

/** Возврат useRangeDragListeners */
export interface UseRangeDragListenersReturn {
	/** Подписать документ на движение и отпускание указателя выбранного вида */
	addListeners: (kind: RangeDragKind) => void
}
