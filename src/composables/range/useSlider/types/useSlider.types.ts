import type { ComputedRef, DeepReadonly, Ref } from 'vue'
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
	/** Количество страниц навигации: остановки через `slidesPerGroup` и последний слайд */
	pageCount: ComputedRef<number>
	/** Индекс текущей страницы */
	currentPage: ComputedRef<number>
	/** Перейти к слайду по индексу */
	goTo: (index: number) => void
	/** Следующий слайд */
	goNext: () => void
	/** Предыдущий слайд */
	goPrev: () => void
	/** Номер слайда, с которого начинается страница навигации (последняя страница — последний возможный слайд) */
	pageStart: (page: number) => number
	/** Перейти к странице навигации */
	goToPage: (page: number) => void
	/**
	 * Автопрокрутка остановлена: кнопкой (`stopAutoplay`), фокусом на слайде или стрелке, запуском видео, reduced motion.
	 * Подпись кнопки «Остановить/Запустить» — по этому флагу (APG Carousel)
	 */
	isAutoplayStopped: DeepReadonly<Ref<boolean>>
	/** Слайды сейчас листаются сами: на это время live-регион слайдов выключен (`aria-live="off"`) */
	isRotating: DeepReadonly<Ref<boolean>>
	/** Временная пауза таймера (флаги паузы не меняет; `resumeAutoplay` запустит снова) */
	pauseAutoplay: () => void
	/** Перезапуск таймера, если ничто не держит паузу */
	resumeAutoplay: () => void
	/** Остановить автопрокрутку до `playAutoplay` (кнопка «Остановить») */
	stopAutoplay: () => void
	/** Запустить автопрокрутку снова (кнопка «Запустить»); указатель над слайдером по-прежнему держит паузу */
	playAutoplay: () => void
	/** Обработчик mouseenter корня: пауза автопроигрывания, пока указатель над слайдером */
	onMouseEnter: () => void
	/** Обработчик mouseleave корня: возобновление, если фокус не внутри слайдера */
	onMouseLeave: () => void
	/**
	 * Обработчик focusin корня: фокус на слайде или стрелке останавливает автопрокрутку до кнопки «Запустить» (APG);
	 * фокус на кнопке с атрибутом `data-slider-rotation` — нет
	 */
	onFocusIn: (event: FocusEvent) => void
	/** Обработчик focusout корня: возобновление, когда фокус покинул слайдер и указатель не над ним */
	onFocusOut: (event: FocusEvent) => void
	/** Обработчик touchstart */
	onTouchStart: (event: TouchEvent) => void
	/** Обработчик touchmove */
	onTouchMove: (event: TouchEvent) => void
	/** Обработчик touchend */
	onTouchEnd: (event: TouchEvent) => void
	/** Обработчик touchcancel: жест прерван, слайд не меняется */
	onTouchCancel: () => void
	/** Обработчик mousedown viewport: перетаскивание только левой кнопкой и не с полей ввода и видео */
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

/** Возврат useSliderNavigation: текущий слайд, страницы и переходы */
type UseSliderNavigationReturn = Pick<
	UseSliderReturn,
	'currentIndex' | 'maxIndex' | 'pageCount' | 'currentPage' | 'pageStart' | 'goTo' | 'goNext' | 'goPrev' | 'goToPage'
>

/** Возврат useSliderAutoplay: управление автопрокруткой и обработчики корня, ставящие её на паузу */
type UseSliderAutoplayReturn = Pick<
	UseSliderReturn,
	| 'isAutoplayStopped'
	| 'isRotating'
	| 'pauseAutoplay'
	| 'resumeAutoplay'
	| 'stopAutoplay'
	| 'playAutoplay'
	| 'onMouseEnter'
	| 'onMouseLeave'
	| 'onFocusIn'
	| 'onFocusOut'
>

/** Что нужно автопрокрутке от навигации */
interface SliderAutoplayControls {
	/** Следующий слайд */
	goNext: () => void
	/** Есть куда листать (больше одного экрана слайдов) */
	canRotate: () => boolean
}

/** Возврат useSliderViewport */
interface UseSliderViewportReturn {
	/** Ref на viewport элемент */
	viewportRef: Ref<HTMLElement | null>
	/** Размер viewport по оси прокрутки, px; обновляется ResizeObserver */
	viewportSize: Ref<number>
	/** Размер viewport по оси прокрутки, прочитанный из DOM сейчас; без элемента — 0 */
	measure: () => number
}

export type {
	ResolvedSliderOptions,
	SliderAutoplayControls,
	SliderTrackStyleInput,
	UseSliderAutoplayReturn,
	UseSliderNavigationReturn,
	UseSliderOptions,
	UseSliderReturn,
	UseSliderViewportReturn,
}
