import type { UiProp } from '@composables/base/useUi'
import type { PropsWithDefaults } from '@composables/base/useDefaults'
import type { BaseComponentProps } from '@composables/base/useBaseComponent'

/**
 * Варианты оформления окна согласия:
 * default — карточка с рамкой и тенью, soft — мягкий фон без тени, outline — рамка без тени.
 */
export const COOKIE_CONSENT_VARIANTS = ['default', 'outline', 'soft'] as const

export type CookieConsentVariant = (typeof COOKIE_CONSENT_VARIANTS)[number]

/** Положение окна: по центру внизу или в нижнем левом / правом углу */
export const COOKIE_CONSENT_POSITIONS = ['bottom', 'bottom-left', 'bottom-right'] as const

export type CookieConsentPosition = (typeof COOKIE_CONSENT_POSITIONS)[number]

/**
 * Части окна согласия для пропа `ui` (БЭМ-элементы `.base-cookie-consent__<часть>`, `root` — окно):
 * content — заголовок и описание, title — заголовок, description — описание, settings — список категорий,
 * category — строка категории, category-description — описание категории под переключателем, hint — пометка «Всегда включены», actions — ряд кнопок,
 * customize / accept-selected / accept-all — кнопки.
 */
export const COOKIE_CONSENT_PARTS = [
	'content',
	'title',
	'description',
	'settings',
	'category',
	'category-description',
	'hint',
	'actions',
	'customize',
	'accept-selected',
	'accept-all',
] as const

export type BaseCookieConsentPart = (typeof COOKIE_CONSENT_PARTS)[number]

/** Категория cookies в окне согласия */
export interface CookieCategory {
	/** Идентификатор категории: он попадает в `v-model`, события и `localStorage` */
	id: string
	/** Название категории — подпись переключателя */
	label: string
	/** Что делают cookies этой категории */
	description?: string
	/** Обязательная категория: включена, выключить нельзя, всегда входит в выбор */
	isRequired?: boolean
}

export interface BaseCookieConsentProps extends BaseComponentProps<
	CookieConsentVariant,
	| 'root'
	| 'content'
	| 'title'
	| 'description'
	| 'settings'
	| 'category'
	| 'hint'
	| 'actions'
	| 'customize'
	| 'acceptSelected'
	| 'acceptAll'
> {
	/** Категории cookies. Обязательные (`isRequired`) всегда входят в выбор */
	categories?: CookieCategory[]
	/** Выбранные категории — их `id` (`v-model`). Пока не задано, выбраны только обязательные */
	modelValue?: string[]
	/** Показано ли окно (`v-model:is-open`); после решения становится `false` */
	isOpen?: boolean
	/** Раскрыты ли настройки категорий (`v-model:is-settings-open`) */
	isSettingsOpen?: boolean
	/** Заголовок (по умолчанию — из словаря) */
	title?: string
	/** Описание (по умолчанию — из словаря; заменяется слотом default) */
	description?: string
	/**
	 * Ключ запоминания решения в `localStorage` (`rise-cookie-consent:<ключ>`): принятое решение не показывается снова,
	 * а выбор восстанавливается в `v-model` после монтирования. Если хранилище недоступно, окно показывается при каждой загрузке.
	 */
	storageKey?: string
	/** Положение окна */
	position?: CookieConsentPosition
	/** Окно позиционируется внутри ближайшего контейнера с `position: relative`, а не в окне браузера (для демонстраций и встроенных областей) */
	isContained?: boolean
	/**
	 * Классы частей окна (`root`, `content`, `title`, `description`, `settings`, `category`, `category-description`, `hint`, `actions`, `customize`,
	 * `accept-selected`, `accept-all`) — добавляются к классам кита.
	 * Глобально — `createUiKitPlugin({ defaults: { BaseCookieConsent: { ui } } })`, классы плагина и экземпляра склеиваются.
	 *
	 * @example
	 * <BaseCookieConsent :categories="categories" :ui="{ root: 'my-consent', actions: 'justify-end' }" />
	 */
	ui?: UiProp<BaseCookieConsentPart>
}

export interface BaseCookieConsentEmits {
	/** Изменился выбор категорий: переключателем, восстановлением из `storageKey` или кнопкой «Принять все» (`v-model`) */
	(event: 'update:modelValue', value: string[]): void
	/** Окно показано или закрыто (`v-model:is-open`) */
	(event: 'update:isOpen', value: boolean): void
	/** Настройки раскрыты или свёрнуты (`v-model:is-settings-open`) */
	(event: 'update:isSettingsOpen', value: boolean): void
	/** Выбор изменился (переключатель, «Принять все», восстановление из `storageKey`): `id` выбранных категорий, обязательные включены */
	(event: 'change', value: string[]): void
	/** Пользователь принял решение — «Принять все» или «Только выбранные»: `id` разрешённых категорий. Окно после этого закрывается */
	(event: 'accept', value: string[]): void
}

export interface BaseCookieConsentSlots {
	/** Описание вместо `description`: можно добавить ссылку на политику конфиденциальности */
	default?: () => unknown
}

export type CookieConsentProps = PropsWithDefaults<
	BaseCookieConsentProps,
	'categories' | 'isOpen' | 'isSettingsOpen' | 'position' | 'isContained'
>
