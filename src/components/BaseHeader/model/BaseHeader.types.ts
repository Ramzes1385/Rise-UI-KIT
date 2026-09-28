import type { ContainerSize } from '@components/BaseContainer'
import type { DrawerDirection } from '@components/BaseDrawer'
import type { BaseComponentProps } from '@composables/useBaseComponent'
import type { LinkTo } from '@composables/useLink'

/**
 * Варианты оформления BaseHeader: `default` — фон страницы и линия снизу, `soft` — приглушённый фон без линии,
 * `ghost` — прозрачная шапка без линии (поверх обложки)
 */
export const HEADER_VARIANTS = ['default', 'soft', 'ghost'] as const

/**
 * Пропсы компонента BaseHeader.
 * `sizeScale` масштабирует высоту, отступы и кегль; `color` задаёт фон и текст.
 */
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
	/** Имя кнопки меню и заголовок выдвижного меню (по умолчанию «Меню») */
	menuLabel?: string
	/** Край окна, от которого выезжает меню */
	menuDirection?: DrawerDirection
}

/**
 * Слоты компонента BaseHeader
 */
export interface BaseHeaderSlots {
	/** Навигация посередине. Если есть слот menu, на экране уже 768px она скрыта */
	default?: () => unknown
	/** Начало шапки: логотип и название (вместо title) */
	start?: () => unknown
	/** Конец шапки: действия (поиск, тема, профиль) */
	end?: () => unknown
	/** Меню для узкого экрана: открывается кнопкой в выдвижной панели; close — закрыть меню (после перехода по ссылке) */
	menu?: (props: { close: () => void }) => unknown
}
