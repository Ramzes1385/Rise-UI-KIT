import type { ChatBadge } from '../../../types/BaseChat.types'
import type { PropsWithDefaults } from '@composables/base/useDefaults'

export interface ChatBadgesProps {
	/** Значки участника */
	badges: ChatBadge[]
	/** Сколько значков видно; остальные — счётчиком «+N» с подсказкой */
	max?: number
	/** Полный список с подписями — для профиля участника */
	isLabeled?: boolean
	sizeScale: number
}

export type BadgesProps = PropsWithDefaults<ChatBadgesProps, 'max'>
