import type { PropsWithDefaults } from '@composables/base/useDefaults'
import type { BaseComponentProps } from '@composables/base/useBaseComponent'

/** Варианты — как у BaseAvatar: вариант получает каждый аватар группы */
export const AVATAR_GROUP_VARIANTS = ['default', 'ghost', 'outline', 'shadow', 'soft'] as const

export interface AvatarGroupItem {
	/** Имя: инициалы в аватаре и имя для скринридера */
	name: string
	/** Фото */
	src?: string
}

export interface BaseAvatarGroupProps extends BaseComponentProps<(typeof AVATAR_GROUP_VARIANTS)[number], 'root' | 'item' | 'more'> {
	/** Люди в порядке показа */
	items: AvatarGroupItem[]
	/** Сколько аватаров показать; остальные — «+N» */
	max?: number
	/** Форма аватаров */
	shape?: 'circle' | 'square'
	/** Имя группы для скринридера, например «Участники» */
	ariaLabel?: string
}

export type AvatarGroupProps = PropsWithDefaults<BaseAvatarGroupProps, 'max'>
