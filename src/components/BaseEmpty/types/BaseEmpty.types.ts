import type { UiProp } from '@composables/base/useUi'
import type { BaseComponentProps } from '@composables/base/useBaseComponent'

/**
 * Варианты отображения пустого состояния:
 * default — пунктирная рамка, soft — мягкий фон без рамки, ghost — без фона, рамки и отступов (внутри других блоков).
 */
export const EMPTY_VARIANTS = ['default', 'ghost', 'soft'] as const

export type EmptyVariant = (typeof EMPTY_VARIANTS)[number]

/**
 * Части пустого состояния для пропа `ui` (БЭМ-элементы `.base-empty__<часть>`, `root` — корень):
 * icon-wrapper — обёртка иконки или иллюстрации; content — колонка с заголовком, описанием и телом; title — заголовок;
 * description — описание; body — содержимое слота по умолчанию; actions — кнопки действий.
 */
export const EMPTY_PARTS = ['icon-wrapper', 'content', 'title', 'description', 'body', 'actions'] as const

export type BaseEmptyPart = (typeof EMPTY_PARTS)[number]

export interface BaseEmptyProps extends BaseComponentProps<
	EmptyVariant,
	'root' | 'iconWrapper' | 'icon' | 'content' | 'title' | 'description' | 'body' | 'actions'
> {
	/** Заголовок пустого состояния */
	title?: string
	/** Текст описания */
	description?: string
	/** Имя иконки по умолчанию */
	icon?: string
	/**
	 * Компактный вид для пустого списка, меню или панели: одна строка без рамки и крупной иконки.
	 * Иконка показывается, только если задан `icon` или слот `icon`
	 */
	isCompact?: boolean
	/**
	 * Классы частей (`root`, `icon-wrapper`, `content`, `title`, `description`, `body`, `actions`) — добавляются к классам кита.
	 * Глобально — `createUiKitPlugin({ defaults: { BaseEmpty: { ui } } })`, классы плагина и экземпляра склеиваются.
	 *
	 * @example
	 * <BaseEmpty title="Пусто" :ui="{ root: 'my-empty', title: 'my-empty-title' }" />
	 */
	ui?: UiProp<BaseEmptyPart>
}

export interface BaseEmptyEmits {
	/** Событие клика по кнопке действия, если используется дефолтная кнопка */
	(event: 'action'): void
}

export interface BaseEmptySlots {
	/** Кастомное содержимое описания или дополнительный контент */
	default?: () => unknown
	/** Кастомная иконка или иллюстрация */
	icon?: () => unknown
	/** Кастомные действия (например, кнопки сброса фильтров) */
	actions?: () => unknown
}
