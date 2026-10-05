import type { Ref } from 'vue'
import type { UiProp } from '@composables/base/useUi'
import type { EnterAnimation } from '@composables/app/useMotion'
import type { PropsWithDefaults } from '@composables/base/useDefaults'
import type { BaseComponentProps } from '@composables/base/useBaseComponent'

/** Сторона размещения карточки-подсказки относительно подсвеченного элемента */
export const TOUR_PLACEMENTS = ['top', 'bottom', 'left', 'right', 'auto'] as const

export type TourPlacement = (typeof TOUR_PLACEMENTS)[number]

/**
 * Части тура для пропа `ui`: root — слой тура, overlay — затемнение без цели, spotlight — подсветка цели, card — карточка,
 * arrow — стрелка карточки, panel — оформление карточки (без своего слота), header — шапка, title — заголовок,
 * close — кнопка «Пропустить», content — текст шага, footer — подвал, progress — точки шагов, dot — точка,
 * progress-bar — полоса прогресса, progress-bar-fill — заполнение полосы, counter — счётчик «1 / 3», actions — кнопки
 */
export const TOUR_PARTS = [
	'root',
	'overlay',
	'spotlight',
	'card',
	'arrow',
	'panel',
	'header',
	'title',
	'close',
	'content',
	'footer',
	'progress',
	'dot',
	'progress-bar',
	'progress-bar-fill',
	'counter',
	'actions',
] as const

export type BaseTourPart = (typeof TOUR_PARTS)[number]

export interface TourStep {
	/**
	 * CSS-селектор целевого элемента, который нужно подсветить. Без цели, с неверным селектором или если элемента нет
	 * на странице — карточка по центру экрана, фон затемнён целиком. Цель, появившаяся позже, подсвечивается сразу
	 */
	target?: string
	/** Заголовок шага */
	title?: string
	/** Текст-описание шага */
	content?: string
	/** Предпочтительная сторона размещения карточки для шага */
	placement?: TourPlacement
	/**
	 * Можно ли нажимать на подсвеченный элемент и переходить к нему клавишей Tab на этом шаге. Без значения —
	 * `behavior.allowTargetInteraction`
	 */
	isTargetInteractive?: boolean
}

/** Вычисленные координаты подсветки и карточки */
export interface TourGeometry {
	/** Прямоугольник подсветки целевого элемента */
	spotlight: { top: number; left: number; width: number; height: number }
	/** Координаты карточки-подсказки */
	card: { top: number; left: number }
	/** Итоговая сторона размещения карточки */
	placement: Exclude<TourPlacement, 'auto'>
}

export interface TourLabels {
	/** Текст кнопки перехода к следующему шагу */
	next?: string
	/** Текст кнопки возврата к предыдущему шагу */
	prev?: string
	/** Текст кнопки завершения на последнем шаге */
	finish?: string
	/** Текст кнопки пропуска тура */
	skip?: string
}

export interface TourBehavior {
	/** Закрывать тур при клике по затемнённому фону */
	closeOnOverlayClick?: boolean
	/** Закрывать тур по клавише Escape */
	closeOnEscape?: boolean
	/** Блокировать прокрутку страницы во время тура */
	lockScroll?: boolean
	/** Прокручивать целевой элемент в зону видимости */
	scrollIntoView?: boolean
	/**
	 * Подсвеченный элемент доступен: на него можно нажать мышью, а Tab из карточки доходит до него и возвращается
	 * в карточку. Окно тура тогда не модальное (`aria-modal="false"`), чтобы экранный диктор не скрывал цель.
	 * `false` — цель закрыта затемнением, клик по ней — как по фону. По умолчанию `true`; шаг меняет это
	 * своим `isTargetInteractive`
	 */
	allowTargetInteraction?: boolean
}

export interface BaseTourProps extends BaseComponentProps<
	string,
	| 'root'
	| 'overlay'
	| 'spotlight'
	| 'card'
	| 'arrow'
	| 'cardInner'
	| 'title'
	| 'closeButton'
	| 'closeIcon'
	| 'content'
	| 'footer'
	| 'progress'
	| 'dot'
	| 'counter'
	| 'actions'
	| 'prevButton'
	| 'nextButton'
	| 'finishButton'
> {
	/** Управление видимостью тура (v-model:isOpen) */
	isOpen?: boolean
	/** Список шагов тура */
	steps: TourStep[]
	/** Индекс активного шага (v-model:step) */
	step?: number
	/** Сторона размещения карточки по умолчанию */
	placement?: TourPlacement
	/** Отступ между подсвеченным элементом и карточкой (px) */
	gap?: number
	/** Внутренний отступ подсветки вокруг элемента (px) */
	padding?: number
	/** Скруление подсветки (px) */
	radius?: number
	/** Группа: подписи кнопок */
	labels?: TourLabels
	/** Группа: настройки поведения */
	behavior?: TourBehavior
	/** Показывать кнопку пропуска */
	showSkip?: boolean
	/** Показывать индикатор прогресса (точки шагов) */
	showProgress?: boolean
	/**
	 * Стрелка карточки к подсвеченному элементу. Сторона стрелки меняется вместе со стороной карточки; у края окна
	 * карточка сдвигается внутрь, а стрелка остаётся напротив середины элемента. На мобильном карточка прижата к низу
	 * экрана — стрелка на её верхнем крае, если элемент выше карточки. По умолчанию включена
	 */
	showArrow?: boolean
	/**
	 * Появление и уход карточки: `scale` (по умолчанию) — масштаб от стороны цели, `fade` — только прозрачность,
	 * `slide` — сдвиг со стороны цели, `pop` — масштаб с пружиной, `none` — сразу. Слой тура с затемнением проявляется
	 * плавно (в `none` — сразу). Длительности — токены движения и пресет `data-rise-motion`; при «уменьшить движение» —
	 * сразу. Глобально — `defaults.BaseTour.animation` или `defaults.global.animation`
	 */
	animation?: EnterAnimation
	/**
	 * Классы частей тура: добавляются к БЭМ-классам кита, глобальные — `defaults.BaseTour.ui`.
	 *
	 * @example
	 * <BaseTour :ui="{ panel: 'rounded-3xl', 'progress-bar-fill': 'bg-emerald-500' }" />
	 */
	ui?: UiProp<BaseTourPart>
}

/** Контекст, передаваемый в default-слот карточки тура */
export interface BaseTourSlotContext {
	/** Текущий шаг */
	step: TourStep
	/** Индекс текущего шага */
	index: number
	/** Общее число шагов */
	total: number
	/** Это первый шаг */
	isFirst: boolean
	/** Это последний шаг */
	isLast: boolean
	/** Перейти к следующему шагу */
	next: () => void
	/** Вернуться к предыдущему шагу */
	prev: () => void
	/** Пропустить тур */
	skip: () => void
	/** Завершить тур */
	finish: () => void
}

export interface BaseTourEmits {
	(event: 'update:isOpen', value: boolean): void
	(event: 'update:step', value: number): void
	(event: 'next', index: number): void
	(event: 'prev', index: number): void
	(event: 'change', index: number): void
	(event: 'skip'): void
	(event: 'finish'): void
	(event: 'close'): void
}

export interface BaseTourSlots {
	/** Полностью кастомное содержимое карточки. Получает контекст текущего шага */
	default?: (props: BaseTourSlotContext) => unknown
	/** Кастомный заголовок карточки */
	title?: (props: { step: TourStep; index: number }) => unknown
	/** Кастомное тело карточки */
	content?: (props: { step: TourStep; index: number }) => unknown
}

export type TourProps = PropsWithDefaults<BaseTourProps, 'isOpen' | 'step'>

/** Внутреннее: данные шага для доступности цели и объявлений */
export interface TourTargetOptions {
	props: TourProps
	currentStep: Ref<TourStep | undefined>
	geometry: Ref<TourGeometry | null>
}
