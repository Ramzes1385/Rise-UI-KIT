import type { PropsWithDefaults } from '@composables/base/useDefaults'
import type { BaseComponentProps } from '@composables/base/useBaseComponent'
import type { LinkComponent, LinkTo, ResolvedLink } from '@composables/interaction/useLink'

/**
 * Варианты оформления панели: default — фон страницы и верхняя граница, soft — приподнятый фон без границы,
 * outline — фон страницы и заметная граница, ghost — прозрачная панель без границы.
 */
export const BOTTOM_NAV_VARIANTS = ['default', 'soft', 'outline', 'ghost'] as const

/** Наименьшее рекомендуемое число пунктов (Material, Apple HIG): меньше — предупреждение в консоли */
export const BOTTOM_NAV_MIN_ITEMS = 3

/** Наибольшее рекомендуемое число пунктов: больше — предупреждение, остальное приложение выносит в «Ещё» */
export const BOTTOM_NAV_MAX_ITEMS = 5

/** Сдвиг прокрутки (px), после которого панель с `hideOnScroll` прячется или возвращается */
export const BOTTOM_NAV_SCROLL_THRESHOLD = 8

export type BottomNavVariant = (typeof BOTTOM_NAV_VARIANTS)[number]

type BottomNavElement = 'root' | 'list' | 'item' | 'link' | 'icon' | 'label' | 'badge'

export interface BottomNavItem {
	/** Значение пункта для v-model */
	value: string
	/** Подпись под значком — она же доступное имя пункта */
	label: string
	/** Значок (имя из спрайта) */
	icon: string
	/** Значок выбранного пункта (например, залитый); по умолчанию — `icon` */
	activeIcon?: string
	/** Маршрут приложения: RouterLink (из плагина или vue-router) или `<a href>`. Без `to` и `href` пункт — кнопка */
	to?: LinkTo
	/** Внешний адрес: `<a href>` */
	href?: string
	/** Где открыть ссылку */
	target?: '_blank' | '_self'
	/** Счётчик или метка на значке. `0` и пустая строка — без бейджа; число больше `maxBadge` — «99+» */
	badge?: number | string
	/** Доступное описание пункта (`aria-describedby`) при бейдже. По умолчанию для числа — «3 новых», для строки — сама строка */
	badgeLabel?: string
	/** Выключенный пункт: без адреса, не выбирается */
	isDisabled?: boolean
}

/** Пункт, подготовленный к отрисовке: ссылка или кнопка, выбран ли, значок и бейдж */
export interface BottomNavEntry {
	/** Исходный пункт */
	item: BottomNavItem
	/** Тег и атрибуты: кнопка, `<a href>` или компонент ссылок */
	link: ResolvedLink
	/** Пункт выбран: `aria-current="page"` */
	isActive: boolean
	/** Имя значка с учётом `activeIcon` */
	icon: string
	/** id описания бейджа для `aria-describedby` */
	badgeId: string
	/** Текст бейджа и его доступное описание; `null` — без бейджа */
	badge: { text: string; label: string } | null
}

export interface BaseBottomNavProps extends BaseComponentProps<BottomNavVariant, BottomNavElement> {
	/** Пункты навигации: 3–5 */
	items: BottomNavItem[]
	/** Значение выбранного пункта (v-model). Выбранный пункт получает `aria-current="page"` */
	modelValue?: string | null
	/** Доступное имя ориентира `nav`. По умолчанию — «Нижняя навигация» из словаря */
	ariaLabel?: string
	/** Панель закреплена внизу окна (`position: fixed`); отступ безопасной зоны есть всегда */
	isFixed?: boolean
	/** Прятать панель при прокрутке окна вниз и показывать при прокрутке вверх и при фокусе внутри */
	hideOnScroll?: boolean
	/** Наибольшее число в бейдже: больше — «99+» */
	maxBadge?: number
	/** Компонент ссылок на маршруты. По умолчанию — из плагина, RouterLink (если подключён vue-router) или `a` */
	linkComponent?: LinkComponent
}

export interface BaseBottomNavEmits {
	/** Выбран пункт (v-model) */
	(event: 'update:modelValue', value: string): void
	/** Выбран пункт — кнопка или ссылка */
	(event: 'select', item: BottomNavItem): void
	/** Переход по пункту с адресом: переходит сама ссылка, событие — для аналитики */
	(event: 'navigate', url: LinkTo): void
}

export interface BaseBottomNavSlots {
	/** Значок пункта (вместо BaseIcon) */
	icon?: (props: { item: BottomNavItem; isActive: boolean }) => unknown
	/** Подпись пункта (вместо `label`) */
	label?: (props: { item: BottomNavItem; isActive: boolean }) => unknown
}

export type BottomNavProps = PropsWithDefaults<BaseBottomNavProps, 'isFixed' | 'hideOnScroll' | 'maxBadge' | 'sizeScale'>
