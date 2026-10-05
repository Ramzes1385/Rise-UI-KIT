import type { UiProp } from '@composables/base/useUi'
import type { PaddingProp } from '@composables/base/usePadding'
import type { EnterAnimation } from '@composables/app/useMotion'
import type { PropsWithDefaults } from '@composables/base/useDefaults'
import type { BaseComponentProps } from '@composables/base/useBaseComponent'

export type SlideoverSide = 'left' | 'right'

/**
 * Варианты оформления панели, как у BaseModal:
 * default — рамка и тень; shadow — только тень, без рамки; ghost — без фона, рамки и тени (оформление даёт содержимое слота).
 */
export const SLIDEOVER_VARIANTS = ['default', 'shadow', 'ghost'] as const

export type SlideoverVariant = (typeof SLIDEOVER_VARIANTS)[number]

/**
 * Части панели для пропа `ui`: root — затемнение, panel — панель, header — шапка, title — заголовок,
 * close — кнопка «Закрыть», body — содержимое, footer — подвал.
 */
export const SLIDEOVER_PARTS = ['root', 'panel', 'header', 'title', 'close', 'body', 'footer'] as const

export type BaseSlideoverPart = (typeof SLIDEOVER_PARTS)[number]

/** Из общих props действуют `variant` (оформление панели), `sizeScale` (отступы, кегль, ширина панели) и `color` (фон и текст панели). */
export interface BaseSlideoverProps extends BaseComponentProps<
	SlideoverVariant,
	'root' | 'panel' | 'header' | 'title' | 'body' | 'footer'
> {
	/** Состояние открытия */
	isOpen: boolean
	/** Заголовок */
	title?: string
	/** Сторона появления */
	side?: SlideoverSide
	/** Масштаб ширины панели (100 = 100%, 150 = 150%, 75 = 75%) */
	width?: number
	/** Полноэкранная панель */
	isFullWidth?: boolean
	/** Закрытие по клику на оверлей */
	closeOnOverlay?: boolean
	/** Закрытие по Escape. У панели без затемнения (`hasOverlay: false`) — только когда фокус в панели */
	closeOnEscape?: boolean
	/**
	 * Панель внутри контейнера: рендерится на месте (без teleport) и перекрывает ближайшего родителя с position: relative
	 * (overflow: hidden у родителя прячет панель во время выезда). Такой диалог немодальный: без aria-modal, ловушки фокуса
	 * и блокировки прокрутки страницы.
	 */
	isContained?: boolean
	/**
	 * Целевой контейнер для открытия панели — CSS-селектор или HTMLElement.
	 * Slideover телепортируется в этот контейнер и открывается в его пределах.
	 * Контейнер обязан иметь position: relative и overflow: hidden.
	 * Имеет приоритет над isContained.
	 */
	container?: string | HTMLElement
	/**
	 * Затемнение фона за панелью (по умолчанию `true`): панель модальная — `aria-modal`, ловушка фокуса, блокировка прокрутки,
	 * клик по фону закрывает (`closeOnOverlay`). `false` — немодальная панель: клики проходят на страницу, фокус свободно
	 * уходит из панели и возвращается в неё, страница прокручивается; Escape закрывает панель, только когда фокус в ней
	 */
	hasOverlay?: boolean
	/**
	 * Внутренние отступы шапки, тела и подвала. Число (px) задаёт горизонтальные отступы
	 * (вертикальные остаются базовыми). Либо объект { x, y, top, right, bottom, left }
	 * для точечного управления. По умолчанию — из стилей: 16px по вертикали и 20px по горизонтали.
	 */
	padding?: PaddingProp
	/**
	 * Появление и уход панели: `slide` (по умолчанию) — въезд со своего края на всю ширину панели, `fade` — только
	 * прозрачность, `scale` — масштаб от своего края, `pop` — масштаб с пружиной, `none` — сразу. Длительности — токены
	 * движения и пресет `data-rise-motion`; при «уменьшить движение» — сразу. Глобально — `defaults.BaseSlideover.animation`
	 * или `defaults.global.animation`
	 */
	animation?: EnterAnimation
	/**
	 * Классы частей панели: добавляются к БЭМ-классам кита, глобальные — `defaults.BaseSlideover.ui`.
	 *
	 * @example
	 * <BaseSlideover :ui="{ panel: 'rounded-none', footer: 'justify-between' }" />
	 */
	ui?: UiProp<BaseSlideoverPart>
}

export interface BaseSlideoverEmits {
	(event: 'update:isOpen', value: boolean): void
	(event: 'close'): void
}

export interface BaseSlideoverSlots {
	/** Содержимое панели; длинное прокручивается внутри */
	default?: () => unknown
	/** Заголовок панели */
	header?: () => unknown
	/** Подвал панели */
	footer?: () => unknown
}

export type SlideoverProps = PropsWithDefaults<BaseSlideoverProps, 'width' | 'closeOnOverlay' | 'closeOnEscape'>
