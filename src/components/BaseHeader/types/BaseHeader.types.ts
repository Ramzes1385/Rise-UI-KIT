import type { DrawerDirection } from '@components/BaseDrawer'
import type { ContainerSize } from '@components/BaseContainer'
import type { LinkTo } from '@composables/interaction/useLink'
import type { BaseComponentProps } from '@composables/base/useBaseComponent'

/**
 * Варианты оформления BaseHeader: `default` — фон страницы и линия снизу, `soft` — приглушённый фон без линии,
 * `ghost` — прозрачная шапка без линии (поверх обложки)
 */
export const HEADER_VARIANTS = ['default', 'soft', 'ghost'] as const

/**
 * Место навигации: `center` — посередине (лендинг), `start` — сразу за названием (приложение), `end` — у действий,
 * `stretch` — занимает всё свободное место (поле поиска)
 */
export const HEADER_NAV_ALIGNS = ['start', 'center', 'end', 'stretch'] as const

export type HeaderNavAlign = (typeof HEADER_NAV_ALIGNS)[number]

/** `sizeScale` масштабирует высоту, отступы и кегль; `color` задаёт фон и текст. */
export interface BaseHeaderProps extends BaseComponentProps<(typeof HEADER_VARIANTS)[number], 'root' | 'inner' | 'title' | 'toggle'> {
	/** Название сайта или приложения в начале шапки (заменяется слотом start) */
	title?: string
	/** Ссылка названия: маршрут (RouterLink) */
	to?: LinkTo
	/** Ссылка названия: адрес */
	href?: string
	/** Ширина содержимого шапки — как у BaseContainer: `sm`…`xl` или `full` (во всю ширину) */
	containerSize?: ContainerSize
	/** Шапка прилипает к верху окна при прокрутке */
	isSticky?: boolean
	/** Место навигации (слот по умолчанию) */
	navAlign?: HeaderNavAlign
	/** Компактная шапка: высота 48px вместо 64px и меньше промежутки — для рабочих экранов и вложенных панелей */
	isCompact?: boolean
	/**
	 * Шапка лежит поверх следующего блока (обложки) и не занимает места: `position: absolute` у верха ближайшего
	 * позиционированного предка, `isSticky` не действует. Обычно с `variant="ghost"`
	 */
	isOverlay?: boolean
	/** Имя кнопки меню и заголовок выдвижного меню (по умолчанию «Меню») */
	menuLabel?: string
	/** Край окна, от которого выезжает меню */
	menuDirection?: DrawerDirection
}

export interface BaseHeaderSlots {
	/** Навигация посередине. Если есть слот menu, на экране уже 768px она скрыта */
	default?: () => unknown
	/** Начало шапки: логотип и название (вместо title) */
	start?: () => unknown
	/** Конец шапки: действия (поиск, тема, профиль) */
	end?: () => unknown
	/** Второй ряд под шапкой: категории магазина, вкладки раздела. Остаётся на узком экране и переносится по строкам */
	bottom?: () => unknown
	/** Меню для узкого экрана: открывается кнопкой в выдвижной панели; close — закрыть меню (после перехода по ссылке) */
	menu?: (props: { close: () => void }) => unknown
}
