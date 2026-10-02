import type { PaddingProp } from '@composables/base/usePadding'
import type { BaseComponentProps } from '@composables/base/useBaseComponent'

/**
 * Варианты отображения карточки:
 * default — рамка, outline — рамка темнее (accented), soft — мягкий фон без рамки,
 * ghost — без фона и рамки, shadow — рамка и тень.
 */
export const CARD_VARIANTS = ['default', 'ghost', 'outline', 'shadow', 'soft'] as const

export interface BaseCardProps extends BaseComponentProps<
	(typeof CARD_VARIANTS)[number],
	'root' | 'header' | 'title' | 'subtitle' | 'actions' | 'body' | 'footer'
> {
	/** Заголовок */
	title?: string
	/** Подзаголовок */
	subtitle?: string
	/**
	 * Вид интерактивной карточки: курсор-указатель, при наведении — рамка accented и тень. Только вид:
	 * кнопкой с фокусом и клавишами карточку делает обработчик `@click`, он же включает этот вид.
	 */
	isHoverable?: boolean
	/** Выключенная карточка: `click` не приходит; с обработчиком `@click` — `aria-disabled="true"` и без фокуса */
	isDisabled?: boolean
	/**
	 * Внутренние отступы шапки, тела и подвала. Число (px): Y = значение, X = значение × 2.
	 * Объект { x, y, top, right, bottom, left } задаёт оси напрямую без умножения
	 * (например { x: 25, y: 43 } → 43px сверху/снизу, 25px по бокам); стороны переопределяют оси.
	 * По умолчанию — из стилей: 16px 20px.
	 */
	padding?: PaddingProp
	/** Высота карточки (CSS-значение: `320px`, `50%`, `auto`). Без `scroll` текст тела обрезается до трёх строк. */
	height?: string
	/** Прокрутка тела карточки при заданной `height`: шапка и подвал остаются на месте */
	scroll?: boolean
}

export interface BaseCardSlotBindings {
	/** Масштаб размера */
	sizeScale: number
}

export interface BaseCardSlots {
	/** Содержимое (тело) карточки */
	default?: (props: BaseCardSlotBindings) => unknown
	/** Шапка целиком — заменяет title и subtitle */
	header?: (props: BaseCardSlotBindings) => unknown
	/** Подвал: обычно кнопки действий */
	footer?: (props: BaseCardSlotBindings) => unknown
	/** Действия в заголовке */
	actions?: (props: BaseCardSlotBindings) => unknown
}

export interface BaseCardEmits {
	/**
	 * Клик по карточке. С обработчиком карточка работает как кнопка: `role="button"`, фокус с Tab, Enter и Space
	 * вызывают тот же `click`, имя кнопки — `title`. Кнопки и ссылки внутри такой карточки недоступны скринридеру
	 * как отдельные элементы — для карточки с действиями сделайте кнопкой или ссылкой заголовок, а не всю карточку
	 */
	(event: 'click', payload: MouseEvent): void
}
