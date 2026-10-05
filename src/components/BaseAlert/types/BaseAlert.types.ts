import type { UiProp } from '@composables/base/useUi'
import type { PropsWithDefaults } from '@composables/base/useDefaults'
import type { BaseComponentProps } from '@composables/base/useBaseComponent'

/** Типы оповещений: определяют цвет (роль), иконку и срочность озвучивания (error/warning — role="alert") */
export const ALERT_TYPES = ['info', 'success', 'warning', 'error'] as const

export type AlertType = (typeof ALERT_TYPES)[number]

/**
 * Варианты отображения оповещения:
 * default — заливка цветом роли; soft — мягкий фон роли; outline — рамка роли;
 * ghost — только текст роли; shadow — нейтральная карточка с тенью и иконкой цвета роли.
 */
export const ALERT_VARIANTS = ['default', 'ghost', 'outline', 'shadow', 'soft'] as const

export type AlertVariant = (typeof ALERT_VARIANTS)[number]

/**
 * Части оповещения для пропа `ui` (БЭМ-элементы `.base-alert__<часть>`, `root` — само оповещение):
 * icon-wrapper — обёртка иконки, content — заголовок и описание, title — заголовок, description — обёртка описания,
 * text — текст описания из `description`, actions — действия справа, close — кнопка «Закрыть».
 */
export const ALERT_PARTS = ['icon-wrapper', 'content', 'title', 'description', 'text', 'actions', 'close'] as const

export type BaseAlertPart = (typeof ALERT_PARTS)[number]

export interface BaseAlertProps extends BaseComponentProps<
	AlertVariant,
	'root' | 'iconWrapper' | 'icon' | 'content' | 'title' | 'description' | 'text' | 'actions' | 'close' | 'closeIcon'
> {
	/** Тип оповещения, определяющий иконку и цветовую гамму по умолчанию */
	type?: AlertType
	/** Заголовок оповещения */
	title?: string
	/** Текст описания (если не используется дефолтный слот) */
	description?: string
	/** Отображать ли кнопку закрытия */
	isClosable?: boolean
	/** Кастомная иконка (переопределяет стандартную для типа) */
	icon?: string
	/**
	 * Классы частей оповещения (`root`, `icon-wrapper`, `content`, `title`, `description`, `text`, `actions`, `close`) —
	 * добавляются к классам кита. Глобально — `createUiKitPlugin({ defaults: { BaseAlert: { ui } } })`, классы плагина
	 * и экземпляра склеиваются.
	 *
	 * @example
	 * <BaseAlert title="Сохранено" :ui="{ root: 'shadow-lg', title: 'tracking-wide' }" />
	 */
	ui?: UiProp<BaseAlertPart>
}

export interface BaseAlertEmits {
	/**
	 * Оповещение закрыто кнопкой «Закрыть»: оно скрывается само (уход — прозрачность и масштаб на токенах движения)
	 * и сообщает `close`, когда анимация закончилась. При выключенном движении (`prefers-reduced-motion`,
	 * пресет `none`, `reducedMotion: 'always'`) — сразу. Родитель может убрать его из разметки (`v-if`).
	 */
	(event: 'close'): void
}

export interface BaseAlertSlots {
	/** Кастомное содержимое описания (заменяет проп description) */
	default?: () => unknown
	/** Кастомная иконка слева */
	icon?: () => unknown
	/** Кастомные действия справа (например, кнопки) */
	actions?: () => unknown
}

export type AlertProps = PropsWithDefaults<BaseAlertProps, 'type'>
