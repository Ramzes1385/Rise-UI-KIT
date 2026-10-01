import type { ComputedRef, Ref } from 'vue'
import type { SliderAnimation } from '@components/BaseSlider/types/BaseSlider.types'

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
	/** Отступ между слайдами в px (геттер) */
	spaceBetween?: () => number
	/** Количество видимых слайдов (геттер) */
	slidesPerView?: () => number
	/** Количество слайдов для перелистывания за шаг (геттер) */
	slidesPerGroup?: () => number
	/** Callback при смене слайда */
	onChange?: (index: number) => void
	/** Callback при переходе вперёд */
	onNext?: () => void
	/** Callback при переходе назад */
	onPrev?: () => void
}

interface UseSliderReturn {
	/** Текущий индекс слайда */
	currentIndex: Ref<number>
	/** Смещение при перетаскивании (px) */
	dragOffset: Ref<number>
	/** Флаг перетаскивания */
	isDragging: Ref<boolean>
	/** Ref на viewport элемент */
	viewportRef: Ref<HTMLElement | null>
	/** Стиль трека для transform и gap */
	trackStyle: ComputedRef<Record<string, string>>
	/** Инлайн-стиль отдельного слайда (ширина) */
	slideStyle: ComputedRef<Record<string, string>>
	/** Максимальный индекс слайда */
	maxIndex: ComputedRef<number>
	/** Количество страниц навигации */
	pageCount: ComputedRef<number>
	/** Индекс текущей страницы */
	currentPage: ComputedRef<number>
	/** Перейти к слайду по индексу */
	goTo: (index: number) => void
	/** Следующий слайд */
	goNext: () => void
	/** Предыдущий слайд */
	goPrev: () => void
	/** Перейти к странице навигации */
	goToPage: (page: number) => void
	/** Пауза автопроигрывания */
	pauseAutoplay: () => void
	/** Возобновление автопроигрывания */
	resumeAutoplay: () => void
	/** Обработчик mouseenter корня: пауза автопроигрывания, пока указатель над слайдером */
	onMouseEnter: () => void
	/** Обработчик mouseleave корня: возобновление, если фокус не внутри слайдера */
	onMouseLeave: () => void
	/** Обработчик focusin корня: пауза автопроигрывания, пока фокус внутри слайдера */
	onFocusIn: () => void
	/** Обработчик focusout корня: возобновление, когда фокус покинул слайдер и указатель не над ним */
	onFocusOut: (event: FocusEvent) => void
	/** Обработчик touchstart */
	onTouchStart: (event: TouchEvent) => void
	/** Обработчик touchmove */
	onTouchMove: (event: TouchEvent) => void
	/** Обработчик touchend */
	onTouchEnd: (event: TouchEvent) => void
	/** Обработчик начала перетаскивания мышью */
	onDragStart: (event: MouseEvent) => void
	/** Обработчик click в фазе захвата: гасит click, которым заканчивается перетаскивание мышью */
	onClickCapture: (event: MouseEvent) => void
}

/** Обработчики перехода useSlider: вызываются при смене слайда */
type SliderCallbacks = Pick<UseSliderOptions, 'onChange' | 'onNext' | 'onPrev'>

/** Параметры useSlider со значениями по умолчанию */
type ResolvedSliderOptions = Required<Omit<UseSliderOptions, keyof SliderCallbacks>> & SliderCallbacks

/** Данные для стиля трека слайдера */
interface SliderTrackStyleInput {
	/** Параметры слайдера */
	settings: ResolvedSliderOptions
	/** Текущий индекс слайда */
	currentIndex: number
	/** Размер viewport по оси прокрутки, px */
	viewportSize: number
	/** Смещение при перетаскивании, px */
	dragOffset: number
	/** Идёт перетаскивание — без анимации перехода */
	isDragging: boolean
}

export type { ResolvedSliderOptions, SliderTrackStyleInput, UseSliderOptions, UseSliderReturn }
