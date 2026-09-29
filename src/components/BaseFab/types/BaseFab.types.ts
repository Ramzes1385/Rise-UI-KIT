import type { BaseComponentProps } from '@composables/base/useBaseComponent'

/** Варианты: default — заливка основным цветом; soft — мягкий основной цвет; outline — фон страницы и рамка */
export const FAB_VARIANTS = ['default', 'soft', 'outline'] as const

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
}

export interface BaseFabEmits {
	(event: 'click', e: MouseEvent): void
}
