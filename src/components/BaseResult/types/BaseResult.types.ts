import type { UiProp } from '@composables/base/useUi'
import type { PropsWithDefaults } from '@composables/base/useDefaults'
import type { BaseComponentProps } from '@composables/base/useBaseComponent'

/**
 * Статус экрана итога: определяет цвет роли, иконку и заголовок по умолчанию.
 * `success`, `info`, `warning`, `error` — результат действия; `403`, `404`, `500` — страницы ошибок
 * (вместо иконки показывается крупный код; цвет — `warning`, `info` и `error`).
 */
export const RESULT_STATUSES = ['success', 'info', 'warning', 'error', '403', '404', '500'] as const

export type ResultStatus = (typeof RESULT_STATUSES)[number]

/**
 * Варианты оформления экрана итога:
 * default — без рамки и фона (на странице), soft — мягкий фон карточки, outline — рамка.
 */
export const RESULT_VARIANTS = ['default', 'outline', 'soft'] as const

export type ResultVariant = (typeof RESULT_VARIANTS)[number]

/** Роль статуса: определяет цвет и иконку */
export type ResultRole = 'success' | 'info' | 'warning' | 'error'

/** Теги заголовка экрана итога */
export const RESULT_TITLE_TAGS = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'div'] as const

export type ResultTitleTag = (typeof RESULT_TITLE_TAGS)[number]

/**
 * Части экрана итога для пропа `ui` (БЭМ-элементы `.base-result__<часть>`, `root` — корень):
 * icon-wrapper — круг с иконкой или кодом, code — крупный код 403/404/500, content — колонка с заголовком и описанием,
 * title — заголовок, description — описание, body — подробности (слот по умолчанию), extra — кнопки действий.
 */
export const RESULT_PARTS = ['icon-wrapper', 'code', 'content', 'title', 'description', 'body', 'extra'] as const

export type BaseResultPart = (typeof RESULT_PARTS)[number]

export interface BaseResultProps extends BaseComponentProps<
	ResultVariant,
	'root' | 'iconWrapper' | 'icon' | 'code' | 'content' | 'title' | 'description' | 'body' | 'extra'
> {
	/** Статус: цвет, иконка и тексты по умолчанию */
	status?: ResultStatus
	/** Заголовок (по умолчанию — по статусу из словаря) */
	title?: string
	/** Описание (по умолчанию — по статусу для 403, 404, 500) */
	description?: string
	/** Своя иконка вместо иконки статуса; для 403, 404, 500 заменяет код */
	icon?: string
	/** Тег заголовка: страница ошибки — `h1`, итог внутри раздела — `h2`–`h6` */
	titleTag?: ResultTitleTag
	/**
	 * Озвучивать появление: `success` и `info` — `role="status"`, остальные — `role="alert"`.
	 * Нужно, когда экран итога появляется на месте формы после отправки; для страниц ошибок не нужно.
	 */
	isLive?: boolean
	/**
	 * Классы частей (`root`, `icon-wrapper`, `code`, `content`, `title`, `description`, `body`, `extra`) — добавляются к классам кита.
	 * Глобально — `createUiKitPlugin({ defaults: { BaseResult: { ui } } })`, классы плагина и экземпляра склеиваются.
	 *
	 * @example
	 * <BaseResult status="404" :ui="{ root: 'my-result', title: 'my-result-title' }" />
	 */
	ui?: UiProp<BaseResultPart>
}

export interface BaseResultSlots {
	/** Иконка или иллюстрация вместо иконки статуса и кода */
	icon?: () => unknown
	/** Заголовок вместо `title` */
	title?: () => unknown
	/** Описание вместо `description` */
	description?: () => unknown
	/** Подробности под описанием: код ошибки с копированием, список причин */
	default?: () => unknown
	/** Кнопки действий под подробностями */
	extra?: () => unknown
}

export type ResultProps = PropsWithDefaults<BaseResultProps, 'status' | 'titleTag' | 'isLive'>
