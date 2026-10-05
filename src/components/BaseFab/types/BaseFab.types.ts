import type { UiProp } from '@composables/base/useUi'
import type { BaseComponentProps } from '@composables/base/useBaseComponent'

/** Варианты: default — заливка основным цветом; soft — мягкий основной цвет; outline — фон страницы и рамка */
export const FAB_VARIANTS = ['default', 'soft', 'outline'] as const

/**
 * Части кнопки для пропа `ui` (БЭМ-элементы `.base-fab__<часть>`, `root` — сама кнопка или ссылка):
 * icon — иконка, label — подпись (только при `isExtended`).
 */
export const FAB_PARTS = ['icon', 'label'] as const

export type BaseFabPart = (typeof FAB_PARTS)[number]

/** Угол экрана (или контейнера при isContained) */
export type FabPosition = 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'

export interface BaseFabProps extends BaseComponentProps<(typeof FAB_VARIANTS)[number], 'root' | 'icon' | 'label'> {
	/** Действие — имя кнопки; видно при isExtended, иначе только для скринридера */
	label: string
	/** Иконка (имя из спрайта), по умолчанию plus */
	icon?: string
	/** Широкая кнопка с подписью рядом с иконкой */
	isExtended?: boolean
	/** Угол */
	position?: FabPosition
	/** В углу контейнера (position: absolute) вместо окна — контейнеру нужен position: relative */
	isContained?: boolean
	/** Отключает кнопку */
	isDisabled?: boolean
	/** Маршрут: кнопка становится ссылкой (BaseLink) */
	to?: string
	/** Внешний адрес: кнопка становится ссылкой */
	href?: string
	/**
	 * Классы частей (`root`, `icon`, `label`) — добавляются к классам кита.
	 * Глобально — `createUiKitPlugin({ defaults: { BaseFab: { ui } } })`, классы плагина и экземпляра склеиваются.
	 *
	 * @example
	 * <BaseFab label="Новая задача" :ui="{ root: 'shadow-xl', icon: 'rotate-45' }" />
	 */
	ui?: UiProp<BaseFabPart>
}

export interface BaseFabEmits {
	(event: 'click', e: MouseEvent): void
}
