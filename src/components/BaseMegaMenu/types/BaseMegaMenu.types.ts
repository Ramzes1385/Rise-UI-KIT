import type { LinkTo } from '@composables/interaction/useLink'
import type { BreakpointName } from '@composables/app/useBreakpoint'
import type { PropsWithDefaults } from '@composables/base/useDefaults'
import type { BaseComponentProps } from '@composables/base/useBaseComponent'

export const MEGA_MENU_VARIANTS = ['default', 'ghost', 'outline', 'shadow', 'soft'] as const

export type MegaMenuVariant = (typeof MEGA_MENU_VARIANTS)[number]

/** Как открывается панель раздела: hover — наведением с задержкой и кликом, click — только кликом */
export type MegaMenuTrigger = 'click' | 'hover'

/** Ссылка в панели раздела */
export interface MegaMenuLink {
	/** Ключ ссылки. По умолчанию — label */
	key?: string
	/** Название */
	label: string
	/** Пояснение под названием */
	description?: string
	/** Иконка (имя из спрайта) — в плитке слева */
	icon?: string
	/** Маршрут приложения: строка или объект для RouterLink */
	to?: LinkTo
	/** Адрес вне приложения */
	href?: string
	/** Где открыть ссылку */
	target?: '_blank' | '_self'
	/** Короткая метка справа от названия: «Новое», «Бета» */
	badge?: string
	/** Отключённая ссылка */
	isDisabled?: boolean
}

/** Колонка панели: заголовок и ссылки */
export interface MegaMenuGroup {
	/** Заголовок колонки */
	title?: string
	/** Ссылки колонки */
	items: MegaMenuLink[]
}

/** Промо-блок справа в панели: картинка, заголовок, текст и ссылка */
export interface MegaMenuPromo {
	/** Заголовок */
	title: string
	/** Текст */
	description?: string
	/** Картинка (декоративная, без alt) */
	image?: string
	/** Текст ссылки. По умолчанию — «Подробнее» */
	linkLabel?: string
	/** Маршрут приложения */
	to?: LinkTo
	/** Адрес вне приложения */
	href?: string
}

/** Раздел верхней строки меню */
export interface MegaMenuItem {
	/** Ключ раздела: `v-model:openKey`, id панели. По умолчанию — label; у разделов с одинаковым label задайте key */
	key?: string
	/** Название */
	label: string
	/** Иконка слева от названия */
	icon?: string
	/** Маршрут: раздел без `groups` — обычная ссылка */
	to?: LinkTo
	/** Адрес вне приложения для раздела-ссылки */
	href?: string
	/** Где открыть раздел-ссылку */
	target?: '_blank' | '_self'
	/** Отключённый раздел */
	isDisabled?: boolean
	/** Колонки панели. Раздел с колонками — кнопка, открывающая панель */
	groups?: MegaMenuGroup[]
	/** Промо-блок справа в панели */
	promo?: MegaMenuPromo
}

export interface BaseMegaMenuProps extends BaseComponentProps<
	MegaMenuVariant,
	'root' | 'bar' | 'list' | 'trigger' | 'panel' | 'group' | 'link' | 'promo'
> {
	/** Разделы верхней строки */
	items?: MegaMenuItem[]
	/** Открытый раздел (`v-model:openKey`). Без пропа меню открывает и закрывает разделы само */
	openKey?: string
	/**
	 * Как открывается панель.
	 *
	 * hover — наведением через `openDelay` и кликом; пока панель открыта, наведение на соседний раздел переключает её
	 * сразу; уход курсора закрывает её через `closeDelay`. Клик по разделу, открытому наведением, закрепляет панель.
	 * click — только кликом и с клавиатуры. На тач-экранах и в мобильном виде — всегда клик.
	 */
	trigger?: MegaMenuTrigger
	/** Задержка открытия наведением (мс) */
	openDelay?: number
	/** Задержка закрытия после ухода курсора (мс) */
	closeDelay?: number
	/**
	 * Мобильный вид: на экране уже брейкпоинта строка сворачивается в кнопку «Меню», разделы идут списком,
	 * панели раскрываются под разделом. По умолчанию md
	 */
	mobileBreakpoint?: BreakpointName
	/** Имя ориентира навигации. По умолчанию «Главное меню» */
	ariaLabel?: string
}

export interface BaseMegaMenuEmits {
	/** Открытый раздел изменился: ключ или undefined, если панель закрыта */
	(event: 'update:openKey', key: string | undefined): void
	/** Выбор ссылки в панели или раздела-ссылки; панель после выбора закрывается */
	(event: 'select', link: MegaMenuLink | MegaMenuItem, e: MouseEvent): void
}

export interface MegaMenuLinkSlotProps {
	/** Ссылка */
	link: MegaMenuLink
	/** Колонка ссылки */
	group: MegaMenuGroup
	/** Раздел */
	item: MegaMenuItem
}

export interface MegaMenuPromoSlotProps {
	/** Промо-блок раздела */
	promo: MegaMenuPromo
	/** Раздел */
	item: MegaMenuItem
}

export interface BaseMegaMenuSlots {
	/** Содержимое ссылки в панели (внутри `<a>`): иконка, название, пояснение */
	link?: (props: MegaMenuLinkSlotProps) => unknown
	/** Промо-блок панели целиком */
	promo?: (props: MegaMenuPromoSlotProps) => unknown
	/** Правая часть строки: поиск, кнопки «Войти» и другое */
	end?: () => unknown
}

export interface BaseMegaMenuExpose {
	/** Закрыть открытую панель */
	close: () => void
}

export interface MegaMenuPanelProps {
	/** Раздел, чья панель показана */
	item: MegaMenuItem
	/** Классы частей из customClass */
	classes: Partial<Record<'group' | 'link' | 'promo', string>>
}

export interface MegaMenuPanelEmits {
	(event: 'select', link: MegaMenuLink, e: MouseEvent): void
}

export type MegaMenuPanelSlots = Pick<BaseMegaMenuSlots, 'link' | 'promo'>

/** Кто открыл панель: открытую наведением закрывает уход курсора, открытую кликом или клавиатурой — нет */
export type MegaMenuOpenSource = 'hover' | 'click'

export type MegaMenuProps = PropsWithDefaults<BaseMegaMenuProps, 'trigger' | 'openDelay' | 'closeDelay' | 'mobileBreakpoint' | 'sizeScale'>
