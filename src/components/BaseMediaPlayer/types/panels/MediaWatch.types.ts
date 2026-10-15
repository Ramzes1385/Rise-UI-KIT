import type { BadgeStatus } from '@components/BaseBadge'
import type { MediaActions, MediaElementRef, MediaState } from '../playback/MediaCore.types'

export const MEDIA_WATCH_EVENT_TYPES = ['play', 'pause', 'seek', 'rate'] as const

/** Действие участника совместного просмотра */
export type MediaWatchEventType = (typeof MEDIA_WATCH_EVENT_TYPES)[number]

/** Команда совместного просмотра: плеер отправляет её событием `watch-sync` и применяет через `applyWatchEvent` */
export interface MediaWatchEvent {
	/** Запуск, пауза, перемотка или смена скорости */
	type: MediaWatchEventType
	/** Позиция записи у участника, секунды */
	time: number
	/** Новая скорость — для `rate` */
	rate?: number
}

export const MEDIA_WATCH_MEMBER_STATUSES = ['invited', 'joined'] as const

/** Приглашён или уже смотрит */
export type MediaWatchMemberStatus = (typeof MEDIA_WATCH_MEMBER_STATUSES)[number]

export interface MediaWatchMember {
	/** Ключ участника */
	id: string
	/** Имя в списке участников */
	name: string
	/** Почта — под именем */
	email?: string
	/** Аватар: относительный адрес или http:, https:, blob:, data:; без него — инициалы */
	avatar?: string
	status: MediaWatchMemberStatus
	/** Ведущий — тот, кто открыл комнату */
	isHost?: boolean
}

/** Комната совместного просмотра: ссылку и участников ведёт приложение */
export interface MediaWatchParty {
	/** Ссылка-приглашение: копируется кнопкой и уходит в письме приглашённым */
	link: string
	/** Участники: приглашённые и подключившиеся */
	members?: MediaWatchMember[]
}

/** Участник в окне совместного просмотра */
export interface MediaWatchMemberView extends MediaWatchMember {
	/** Две буквы имени — вместо аватара */
	initials: string
	/** «Смотрит», «Приглашён», «Ведущий» */
	statusText: string
	/** Палитра метки статуса BaseBadge: `success` у подключившегося и ведущего, `neutral` у приглашённого */
	badgeStatus: BadgeStatus
}

export interface MediaWatchOptions {
	party: () => MediaWatchParty | undefined
	media: MediaElementRef
	state: Readonly<MediaState>
	actions: MediaActions
	emitSync: (event: MediaWatchEvent) => void
	emitInvite: (email: string) => void
	copy: (text: string) => void
	flash: (message: string) => void
}
