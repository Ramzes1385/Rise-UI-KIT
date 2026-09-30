import type { PropsWithDefaults } from '@composables/base/useDefaults'
import type { BaseComponentProps } from '@composables/base/useBaseComponent'
import type { AVATAR_RINGS, AVATAR_MASCOTS } from '@components/BaseAvatar/types/BaseAvatar.types'

/** Варианты — как у BaseAvatar: вариант получает каждый аватар группы */
export const AVATAR_GROUP_VARIANTS = ['default', 'ghost', 'outline', 'shadow', 'soft'] as const

export interface AvatarGroupItem {
	/** Имя: инициалы в аватаре и имя для скринридера */
	name: string
	/** Фото или GIF */
	src?: string
	/** Обводка аватара — как `ring` у BaseAvatar */
	ring?: (typeof AVATAR_RINGS)[number]
	/** SVG-персонаж вместо фото — как `mascot` у BaseAvatar */
	mascot?: (typeof AVATAR_MASCOTS)[number]
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
