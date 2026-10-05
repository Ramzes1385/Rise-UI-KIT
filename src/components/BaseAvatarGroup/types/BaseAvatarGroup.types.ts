import type { UiProp } from '@composables/base/useUi'
import type { PropsWithDefaults } from '@composables/base/useDefaults'
import type { BaseComponentProps } from '@composables/base/useBaseComponent'
import type { AVATAR_RINGS, AVATAR_MASCOTS } from '@components/BaseAvatar/types/BaseAvatar.types'

/** Варианты — как у BaseAvatar: вариант получает каждый аватар группы */
export const AVATAR_GROUP_VARIANTS = ['default', 'ghost', 'outline', 'shadow', 'soft'] as const

/**
 * Части группы для пропа `ui` (БЭМ-элементы `.base-avatar-group__<часть>`, `root` — список):
 * item — пункт списка (и аватар, и «+N»), name — скрытое имя для скринридера, more — пункт «+N», count — число «+N».
 */
export const AVATAR_GROUP_PARTS = ['item', 'name', 'more', 'count'] as const

export type BaseAvatarGroupPart = (typeof AVATAR_GROUP_PARTS)[number]

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
	/**
	 * Люди в порядке показа. Пришедшие и ушедшие появляются и уходят с «pop», соседи плавно сдвигаются; число «+N»
	 * меняется с «pop» (токены движения; при выключенном движении — сразу). Люди с одинаковым `name` различаются по порядку
	 */
	items: AvatarGroupItem[]
	/** Сколько аватаров показать; остальные — «+N» */
	max?: number
	/** Форма аватаров */
	shape?: 'circle' | 'square'
	/** Имя группы для скринридера, например «Участники» */
	ariaLabel?: string
	/**
	 * Классы частей группы (`root`, `item`, `name`, `more`, `count`) — добавляются к классам кита.
	 * Глобально — `createUiKitPlugin({ defaults: { BaseAvatarGroup: { ui } } })`, классы плагина и экземпляра склеиваются.
	 *
	 * @example
	 * <BaseAvatarGroup :items="people" :ui="{ root: 'gap-1', more: 'bg-transparent' }" />
	 */
	ui?: UiProp<BaseAvatarGroupPart>
}

export type AvatarGroupProps = PropsWithDefaults<BaseAvatarGroupProps, 'max'>
