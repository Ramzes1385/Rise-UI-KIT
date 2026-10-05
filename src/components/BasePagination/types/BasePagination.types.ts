import type { UiProp } from '@composables/base/useUi'
import type { PropsWithDefaults } from '@composables/base/useDefaults'
import type { BaseComponentProps } from '@composables/base/useBaseComponent'

export const PAGINATION_VARIANTS = ['default', 'ghost', 'outline', 'shadow', 'soft'] as const

/**
 * Части пагинации для пропа `ui` (БЭМ-элементы `.base-pagination__<часть>`, `root` — сам `<nav>`):
 * arrow — стрелки «назад» и «вперёд»; pages — список номеров; page — кнопка номера страницы;
 * ellipsis — многоточие на месте пропущенных страниц; indicator — подложка текущей страницы, которая переезжает между номерами.
 */
export const PAGINATION_PARTS = ['arrow', 'pages', 'page', 'ellipsis', 'indicator'] as const

export type BasePaginationPart = (typeof PAGINATION_PARTS)[number]

export interface BasePaginationProps extends BaseComponentProps<
	(typeof PAGINATION_VARIANTS)[number],
	'root' | 'prev' | 'next' | 'pages' | 'button' | 'ellipsis'
> {
	/** Текущая страница. Подложка текущей страницы переезжает к новому номеру на токенах движения; при выключенном движении — сразу */
	modelValue: number
	/** Всего элементов */
	total: number
	/** Элементов на странице */
	pageSize?: number
	/** Количество отображаемых кнопок (включая первую и последнюю) */
	maxVisible?: number
	/** Показывать последнюю страницу всегда */
	showLastPage?: boolean
	/** Имя ориентира `<nav>`. По умолчанию «Пагинация»; задайте своё, если пагинаций на странице несколько: «Страницы заказов» */
	ariaLabel?: string
	/**
	 * Классы частей пагинации (`root`, `arrow`, `pages`, `page`, `ellipsis`, `indicator`) — добавляются к классам кита.
	 * Глобально — `createUiKitPlugin({ defaults: { BasePagination: { ui } } })`, классы плагина и экземпляра склеиваются.
	 *
	 * @example
	 * <BasePagination v-model="page" :total="200" :ui="{ page: 'tabular-nums', indicator: 'shadow-md' }" />
	 */
	ui?: UiProp<BasePaginationPart>
}

export interface BasePaginationEmits {
	(event: 'update:modelValue', value: number): void
	(event: 'change', value: number): void
}

/** Слотов нет: содержимое строится из props */
export type BasePaginationSlots = Record<never, never>

export type PaginationProps = PropsWithDefaults<BasePaginationProps, 'pageSize' | 'maxVisible' | 'showLastPage' | 'sizeScale'>
