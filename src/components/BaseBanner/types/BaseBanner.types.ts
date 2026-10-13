import type { UiProp } from '@composables/base/useUi'
import type { PropsWithDefaults } from '@composables/base/useDefaults'
import type { BaseComponentProps } from '@composables/base/useBaseComponent'

/** Типы объявления: определяют цвет роли и иконку по умолчанию (`primary` — акцент кита) */
export const BANNER_TYPES = ['primary', 'info', 'success', 'warning', 'error'] as const

export type BannerType = (typeof BANNER_TYPES)[number]

/**
 * Варианты оформления объявления:
 * default — заливка цветом роли, soft — мягкий фон роли, outline — белая полоса с рамкой роли.
 */
export const BANNER_VARIANTS = ['default', 'outline', 'soft'] as const

export type BannerVariant = (typeof BANNER_VARIANTS)[number]

/** Положение полосы: static — в потоке страницы, sticky — прилипает к верху окна или контейнера прокрутки */
export const BANNER_POSITIONS = ['static', 'sticky'] as const

export type BannerPosition = (typeof BANNER_POSITIONS)[number]

/**
 * Части объявления для пропа `ui` (БЭМ-элементы `.base-banner__<часть>`, `root` — полоса):
 * body — строка с содержимым, icon-wrapper — обёртка иконки, content — текст и действие,
 * text — текст из `text`, action — ссылка или кнопка из слота, close — кнопка «Закрыть».
 */
export const BANNER_PARTS = ['body', 'icon-wrapper', 'content', 'text', 'action', 'close'] as const

export type BaseBannerPart = (typeof BANNER_PARTS)[number]

export interface BaseBannerProps extends BaseComponentProps<
	BannerVariant,
	'root' | 'body' | 'iconWrapper' | 'icon' | 'content' | 'text' | 'action' | 'close' | 'closeIcon'
> {
	/** Тип объявления: цвет роли и иконка по умолчанию */
	type?: BannerType
	/** Текст объявления (заменяется слотом default) */
	text?: string
	/** Своя иконка вместо иконки типа */
	icon?: string
	/** Показывать ли иконку */
	hasIcon?: boolean
	/** Показывать ли кнопку «Закрыть» */
	isClosable?: boolean
	/** Показано ли объявление (`v-model:is-open`). Закрытие кнопкой само ставит `false` и сообщает `update:isOpen` */
	isOpen?: boolean
	/**
	 * Ключ запоминания закрытия в `localStorage` (`rise-banner:<ключ>`): закрытое объявление не показывается снова.
	 * Хранилище читается после монтирования (SSR без падений); пока оно не прочитано, объявление не выводится вовсе —
	 * запомненное закрытие не мигает и скрывается без анимации. Если хранилище недоступно, объявление просто показывается.
	 * Вернуть показ — `v-model:is-open` в `true` или удалить запись.
	 */
	storageKey?: string
	/**
	 * Озвучивать появление: `warning` и `error` — `role="alert"`, остальные — `role="status"` (вместо `region`, имя `label` остаётся).
	 * Нужно, когда объявление появляется уже после загрузки страницы по событию приложения (потеря соединения, новая версия);
	 * для объявления, которое есть в разметке с самого начала, не нужно: оно читается как обычная область
	 */
	isLive?: boolean
	/** Положение: `static` — в потоке, `sticky` — прилипает к верху */
	position?: BannerPosition
	/** Доступное имя области объявления (`aria-label`); по умолчанию — «Объявление» из словаря */
	label?: string
	/**
	 * Классы частей объявления (`root`, `body`, `icon-wrapper`, `content`, `text`, `action`, `close`) — добавляются к классам кита.
	 * Глобально — `createUiKitPlugin({ defaults: { BaseBanner: { ui } } })`, классы плагина и экземпляра склеиваются.
	 *
	 * @example
	 * <BaseBanner text="Скидка 20%" :ui="{ root: 'my-banner', text: 'font-semibold' }" />
	 */
	ui?: UiProp<BaseBannerPart>
}

export interface BaseBannerEmits {
	/** Изменился показ объявления: закрытие кнопкой или запомненное закрытие из `storageKey` (`v-model:is-open`). После закрытия фокус, бывший внутри объявления, переходит на следующий фокусируемый элемент страницы */
	(event: 'update:isOpen', value: boolean): void
	/** Объявление закрыто кнопкой «Закрыть» (не приходит при запомненном закрытии из `storageKey`) */
	(event: 'close'): void
}

export interface BaseBannerSlots {
	/** Текст объявления (заменяет проп text) */
	default?: () => unknown
	/** Своя иконка */
	icon?: () => unknown
	/** Ссылка или кнопка действия справа от текста */
	action?: () => unknown
}

export type BannerProps = PropsWithDefaults<BaseBannerProps, 'type' | 'hasIcon' | 'isClosable' | 'isOpen' | 'isLive' | 'position'>
