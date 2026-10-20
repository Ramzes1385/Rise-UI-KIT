import type { UiProp } from '@composables/base/useUi'
import type { PaddingProp } from '@composables/base/usePadding'
import type { BaseComponentProps } from '@composables/base/useBaseComponent'

/**
 * Варианты отображения карточки:
 * default — плоская тональная поверхность (bg-muted) без рамки и тени, soft — более светлый тон (bg-elevated),
 * outline — фон страницы и рамка border-accented, ghost — без фона и рамки, shadow — фон страницы и тень.
 * Поля внутри тональной карточки на ступень светлее её фона (`--rise-field-bg`).
 */
export const CARD_VARIANTS = ['default', 'ghost', 'outline', 'shadow', 'soft'] as const

/**
 * Части карточки для пропа `ui` (БЭМ-элементы `.base-card__<часть>`, `root` — сама карточка): header — шапка,
 * header-text — заголовок с подзаголовком, title, subtitle, actions — действия в шапке, body — тело, footer — подвал.
 */
export const CARD_PARTS = ['header', 'header-text', 'title', 'subtitle', 'actions', 'body', 'footer'] as const

export type BaseCardPart = (typeof CARD_PARTS)[number]

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
	 * По умолчанию — токены `--rise-card-padding-y/x` (16px 20px); отступы умножаются на плотность темы `--rise-density`.
	 */
	padding?: PaddingProp
	/** Высота карточки (CSS-значение: `320px`, `50%`, `auto`). Без `scroll` текст тела обрезается до трёх строк. */
	height?: string
	/** Прокрутка тела карточки при заданной `height`: шапка и подвал остаются на месте */
	scroll?: boolean
	/**
	 * Классы частей карточки (`root`, `header`, `header-text`, `title`, `subtitle`, `actions`, `body`, `footer`) —
	 * добавляются к классам кита. Глобально — `defaults.BaseCard.ui` плагина, классы склеиваются.
	 *
	 * @example
	 * <BaseCard title="Отчёт" :ui="{ header: 'bg-slate-50', body: 'prose' }" />
	 */
	ui?: UiProp<BaseCardPart>
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
