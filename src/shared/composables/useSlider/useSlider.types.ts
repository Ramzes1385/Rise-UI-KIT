import type { SliderAnimation } from '@/shared/ui/BaseSlider/BaseSlider.types'
import type { ComputedRef, Ref } from 'vue'

/** Параметры composable useSlider */
interface UseSliderOptions {
	/** Количество элементов (геттер) */
	itemCount: () => number
	/** Анимация переключения (геттер) */
	animation?: () => SliderAnimation
	/** Автопроигрывание (геттер) */
	isAutoplay?: () => boolean
	/** Интервал автопроигрывания в мс (геттер) */
	autoplayInterval?: () => number
	/** Бесконечная прокрутка (геттер) */
	isLoop?: () => boolean
	/** Вертикальный режим (геттер) */
	isVertical?: () => boolean
	/** Начальный индекс (геттер) */
	initialIndex?: () => number
	/** Порог snap-переключения в процентах (по умолчанию 20) */
	snapThreshold?: number
	/** Callback при смене слайда */
	onChange?: (index: number) => void
	/** Callback при переходе вперёд */
	onNext?: () => void
	/** Callback при переходе назад */
	onPrev?: () => void
}

/** Возвращаемое значение composable useSlider */
interface UseSliderReturn {
	/** Текущий индекс слайда */
	currentIndex: Ref<number>
	/** Смещение при перетаскивании (px) */
	dragOffset: Ref<number>
	/** Флаг перетаскивания */
	isDragging: Ref<boolean>
	/** Ref на viewport элемент */
	viewportRef: Ref<HTMLElement | null>
	/** Стиль трека для transform */
	trackStyle: ComputedRef<Record<string, string>>
	/** Перейти к слайду по индексу */
	goTo: (index: number) => void
	/** Следующий слайд */
	goNext: () => void
	/** Предыдущий слайд */
	goPrev: () => void
	/** Пауза автопроигрывания */
	pauseAutoplay: () => void
	/** Возобновление автопроигрывания */
	resumeAutoplay: () => void
	/** Обработчик touchstart */
	onTouchStart: (event: TouchEvent) => void
	/** Обработчик touchmove */
	onTouchMove: (event: TouchEvent) => void
	/** Обработчик touchend */
	onTouchEnd: (event: TouchEvent) => void
	/** Обработчик начала перетаскивания мышью */
	onDragStart: (event: MouseEvent) => void
}

export type { UseSliderOptions, UseSliderReturn }
