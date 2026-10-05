import type { UiProp } from '@composables/base/useUi'
import type { BaseComponentProps } from '@composables/base/useBaseComponent'

/** У контейнера одно оформление: он задаёт только ширину и боковые отступы, фона и рамки нет */
export const CONTAINER_VARIANTS = ['default'] as const

/** Наибольшая ширина контейнера (вместе с боковыми отступами) */
export const CONTAINER_SIZES = ['sm', 'md', 'lg', 'xl', 'full'] as const

export type ContainerSize = (typeof CONTAINER_SIZES)[number]

/** Части контейнера для пропа `ui`: root — корень (у контейнера других частей нет) */
export const CONTAINER_PARTS = ['root'] as const

export type BaseContainerPart = (typeof CONTAINER_PARTS)[number]

/** `sizeScale` масштабирует боковые отступы; `variant` и `color` не используются. */
export interface BaseContainerProps extends BaseComponentProps<(typeof CONTAINER_VARIANTS)[number], 'root'> {
	/** Наибольшая ширина: `sm` 640px, `md` 768px, `lg` 1024px, `xl` 1280px, `full` — во всю ширину родителя */
	size?: ContainerSize
	/** Тег корня: `div`, `section`, `article`… */
	tag?: string
	/**
	 * Классы корня: добавляются к БЭМ-классу кита, глобальные — `defaults.BaseContainer.ui`.
	 *
	 * @example
	 * <BaseContainer :ui="{ root: 'py-8' }" />
	 */
	ui?: UiProp<BaseContainerPart>
}

export interface BaseContainerSlots {
	/** Содержимое */
	default?: () => unknown
}
