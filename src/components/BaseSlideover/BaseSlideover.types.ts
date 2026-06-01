import type { CustomClassProp } from '@composables/useCustomClass'
import type { PaddingProp } from '@composables/usePadding'

/**
 * Сторона появления slideover
 */
export type SlideoverSide = 'left' | 'right'

/**
 * Пропсы компонента BaseSlideover
 */
export interface BaseSlideoverProps {
	/** Кастомные классы */
	customClass?: CustomClassProp
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
	/** Режим ограничения внутри контейнера. Компонент рендерится на месте (без teleport), родитель должен иметь position: relative и overflow: hidden */
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
	 * Внутренние отступы контента. Число (px) задаёт горизонтальные отступы
	 * (вертикальные остаются базовыми). Либо объект { x, y, top, right, bottom, left }
	 * для точечного управления. По умолчанию 24
	 */
	padding?: PaddingProp
}

/**
 * События компонента BaseSlideover
 */
export interface BaseSlideoverEmits {
	(event: 'update:isOpen', value: boolean): void
	(event: 'close'): void
}
