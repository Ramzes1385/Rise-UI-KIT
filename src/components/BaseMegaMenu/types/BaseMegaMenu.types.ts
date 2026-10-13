import type { LinkTo } from '@composables/interaction/useLink'
import type { UiClassFn, UiProp } from '@composables/base/useUi'
import type { BreakpointName } from '@composables/app/useBreakpoint'
import type { PropsWithDefaults } from '@composables/base/useDefaults'
import type { BaseComponentProps } from '@composables/base/useBaseComponent'

export const MEGA_MENU_VARIANTS = ['default', 'ghost', 'outline', 'shadow', 'soft'] as const

export type MegaMenuVariant = (typeof MEGA_MENU_VARIANTS)[number]

/**
 * Части меню для пропа `ui` (БЭМ-элементы `.base-mega-menu__<часть>`, `root` — `<nav>`): bar — строка разделов;
 * toggle — кнопка «Меню» мобильного вида; list — список разделов; item — пункт списка; trigger — раздел (кнопка или
 * ссылка); end — правая часть строки (слот `end`); panel — панель раздела (и раскрытая под разделом в мобильном виде);
 * content — содержимое панели; group — колонка; group-title — заголовок колонки; link — ссылка в колонке; sub — вложенный
 * уровень ссылок; back — кнопка «Назад» режима drill-down; link-icon — плитка иконки ссылки; link-label — название ссылки; link-desc — пояснение; promo — промо-блок.
 */
export const MEGA_MENU_PARTS = [
	'bar',
	'toggle',
	'list',
	'item',
	'trigger',
	'end',
	'panel',
	'content',
	'group',
	'group-title',
	'link',
	'sub',
	'back',
	'link-icon',
	'link-label',
	'link-desc',
	'promo',
] as const

export type BaseMegaMenuPart = (typeof MEGA_MENU_PARTS)[number]

/** Классы частей меню из пропа `ui` — для внутренних частей */
type MegaMenuUi = UiClassFn<BaseMegaMenuPart>

export const MEGA_MENU_DRILLDOWNS = ['never', 'auto', 'always'] as const

/**
 * Как показываются вложенные уровни ссылок. never — каскадом справа от пункта (под строкой, если не хватает места);
 * always — drill-down внутри колонки: уровень заменяет список колонки, над ним заголовок уровня и кнопка «Назад»;
 * auto — drill-down, если вложенность каталога раздела не меньше `drilldownFrom` уровней (иначе каскад)
 */
export type MegaMenuDrilldown = (typeof MEGA_MENU_DRILLDOWNS)[number]

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
	/**
	 * Вложенный уровень — ссылки подменю. Пункт с `children` — кнопка: уровень раскрывается справа от пункта, а если справа
	 * не хватает места — под строкой пункта, прижат к её правому краю; в режиме `drilldown` — заменяет список колонки
	 * с кнопкой «Назад»; в мобильном виде — списком под пунктом. `to`, `href` и `target` у такого пункта не используются.
	 * Глубина не ограничена
	 */
	children?: MegaMenuLink[]
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
	/** Текущий раздел сайта: подчёркнут в строке, `aria-current` */
	isActive?: boolean
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
	/**
	 * Вложенные уровни ссылок (`MegaMenuLink.children`): `never` — каскад, `always` — drill-down внутри колонки,
	 * `auto` — drill-down для разделов, где вложенность каталога не меньше `drilldownFrom`. В мобильном виде уровни
	 * всегда списком под пунктом. По умолчанию `never`: прежнее поведение
	 */
	drilldown?: MegaMenuDrilldown
	/**
	 * Для `drilldown: 'auto'`: с какой вложенности каталога включается drill-down. Колонка со ссылками — уровень 1,
	 * их `children` — уровень 2, `children` вложенных — уровень 3. По умолчанию 3: каскад остаётся для двух уровней
	 */
	drilldownFrom?: number
	/** Имя ориентира навигации. По умолчанию «Главное меню» */
	ariaLabel?: string
	/**
	 * Классы частей меню (`root`, `bar`, `trigger`, `panel`, `link`… — см. `MEGA_MENU_PARTS`) — добавляются к классам кита.
	 * Глобально — `createUiKitPlugin({ defaults: { BaseMegaMenu: { ui } } })`, классы плагина и экземпляра склеиваются.
	 *
	 * @example
	 * <BaseMegaMenu :items="items" :ui="{ bar: 'shadow-sm', panel: 'rounded-2xl', link: 'gap-4' }" />
	 */
	ui?: UiProp<BaseMegaMenuPart>
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
	/** Уровень ссылки: 0 — в колонке, 1 и глубже — во вложенных уровнях */
	depth: number
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

/** Задержки наведения для вложенных уровней (мс) */
interface MegaMenuHoverDelays {
	/** Задержка открытия уровня */
	open: number
	/** Задержка закрытия уровня после ухода курсора на соседний пункт */
	close: number
}

export interface MegaMenuPanelProps {
	/** Раздел, чья панель показана */
	item: MegaMenuItem
	/** Классы частей из customClass */
	classes: Partial<Record<'group' | 'link' | 'promo', string>>
	/** Задержки наведения; без них вложенные уровни открываются только кликом и с клавиатуры */
	hoverDelays?: MegaMenuHoverDelays
	/** Классы частей из пропа `ui` */
	ui: MegaMenuUi
	/** Движение выключено (пресет `none`, «уменьшить движение»): вложенные уровни появляются сразу */
	isMotionReduced?: boolean
	/** Вложенные уровни показываются заменой списка колонки (drill-down), а не каскадом */
	isDrilldown?: boolean
}

export interface MegaMenuDrillGroupProps {
	/** Колонка */
	group: MegaMenuGroup
	/** Раздел */
	item: MegaMenuItem
	/** id заголовка колонки; на нём строятся id уровней */
	titleId: string
	/** Префикс id пунктов колонки */
	linksId: string
	/** Класс колонки из customClass */
	groupClass?: string
	/** Класс ссылки из customClass */
	linkClass?: string
	/** Классы частей из пропа `ui` */
	ui: MegaMenuUi
	/** Движение выключено: уровни меняются сразу */
	isMotionReduced?: boolean
}

export interface MegaMenuDrillGroupEmits {
	(event: 'select', link: MegaMenuLink, e: MouseEvent): void
}

export type MegaMenuDrillGroupSlots = Pick<BaseMegaMenuSlots, 'link'>

/** Где открыт вложенный уровень: справа от пункта или, если справа не хватает места, под строкой пункта у её правого края */
export type MegaMenuSubPlacement = 'side' | 'below'

/** Пункт уровня с идентификаторами для ARIA и фокуса */
export interface MegaMenuLinkEntry {
	/** Ссылка */
	link: MegaMenuLink
	/** Уровень */
	depth: number
	/** id пункта */
	id: string
	/** id вложенного уровня пункта */
	subId: string
	/** id пункта-родителя уровня (у уровня 0 — префикс колонки) */
	parentId: string
}

export interface MegaMenuLinksProps {
	/** Ссылки уровня */
	links: MegaMenuLink[]
	/** Уровень: 0 — колонка панели */
	depth: number
	/** id пункта-родителя уровня; у уровня 0 — префикс колонки */
	parentId: string
	/** Колонка */
	group: MegaMenuGroup
	/** Раздел */
	item: MegaMenuItem
	/** Класс ссылки из customClass */
	linkClass?: string
	/** Классы частей из пропа `ui` */
	ui: MegaMenuUi
}

export interface MegaMenuLinkContentProps {
	/** Ссылка */
	link: MegaMenuLink
	/** Классы частей из пропа `ui` */
	ui: MegaMenuUi
}

export type MegaMenuLinksSlots = Pick<BaseMegaMenuSlots, 'link'>

/** Управление открытыми уровнями для клавиатуры */
export interface MegaMenuCascadeControls {
	/** Открыть уровень пункта (соседние и более глубокие закрываются) */
	open: (entry: MegaMenuLinkEntry) => void
	/** Закрыть уровни начиная с глубины */
	closeFrom: (depth: number) => void
	/** Раскрыт ли уровень пункта */
	isExpanded: (entry: MegaMenuLinkEntry) => boolean
}

/** Состояние вложенных уровней панели: общее для всех уровней, передаётся через provide */
export interface MegaMenuCascadeContext {
	/** Раскрыт ли уровень пункта */
	isExpanded: (entry: MegaMenuLinkEntry) => boolean
	/** Уровень не помещается справа и открыт под строкой пункта */
	isBelow: (entry: MegaMenuLinkEntry) => boolean
	/** Клик по пункту с вложенным уровнем */
	toggle: (entry: MegaMenuLinkEntry) => void
	/** Выбор ссылки */
	select: (link: MegaMenuLink, event: MouseEvent) => void
	/** Наведение на пункт */
	handleEnter: (entry: MegaMenuLinkEntry, event: PointerEvent) => void
	/** Клавиши на пункте */
	handleKeydown: (entry: MegaMenuLinkEntry, event: KeyboardEvent) => void
	/** Движение выключено: уровни появляются без перехода */
	isMotionReduced: () => boolean
	/** Уровни заменяют список колонки (drill-down): у пункта нет `aria-expanded` */
	isDrilldown: boolean
}

export interface MegaMenuPanelEmits {
	(event: 'select', link: MegaMenuLink, e: MouseEvent): void
}

export type MegaMenuPanelSlots = Pick<BaseMegaMenuSlots, 'link' | 'promo'>

/** Кто открыл панель: открытую наведением закрывает уход курсора, открытую кликом или клавиатурой — нет */
export type MegaMenuOpenSource = 'hover' | 'click'

export type MegaMenuProps = PropsWithDefaults<
	BaseMegaMenuProps,
	'trigger' | 'openDelay' | 'closeDelay' | 'mobileBreakpoint' | 'drilldown' | 'drilldownFrom' | 'sizeScale'
>
