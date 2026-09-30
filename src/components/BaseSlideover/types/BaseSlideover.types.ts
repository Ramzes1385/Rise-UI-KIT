import type { PaddingProp } from '@composables/base/usePadding'
import type { PropsWithDefaults } from '@composables/base/useDefaults'
import type { BaseComponentProps } from '@composables/base/useBaseComponent'

export type SlideoverSide = 'left' | 'right'

/** Из общих props действуют `sizeScale` (отступы, кегль, ширина панели) и `color` (фон и текст панели); `variant` не используется — у панели одно оформление. */
export interface BaseSlideoverProps extends BaseComponentProps<string, 'root' | 'panel' | 'header' | 'title' | 'body' | 'footer'> {
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
	/** Закрытие по Escape */
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
	/** Показывать затемнение фона за панелью */
	hasOverlay?: boolean
	/**
	 * Внутренние отступы шапки, тела и подвала. Число (px) задаёт горизонтальные отступы
	 * (вертикальные остаются базовыми). Либо объект { x, y, top, right, bottom, left }
	 * для точечного управления. По умолчанию — из стилей: 16px по вертикали и 20px по горизонтали.
	 */
	padding?: PaddingProp
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
