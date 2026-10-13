import type { ChatMessage } from '../../../../types/BaseChat.types'

/** Элемент ленты: сообщение или служебный разделитель между сообщениями */
export type ChatTimelineItem =
	| { type: 'message'; key: string; message: ChatMessage }
	| { type: 'date'; key: string; label: string }
	| { type: 'unread'; key: string; label: string }

export interface ChatTimelineOptions {
	/** Сообщения ленты в порядке показа */
	messages: readonly ChatMessage[]
	/** Последнее прочитанное сообщение; разделитель встаёт перед первым чужим сообщением после него */
	lastReadMessageId?: string
	/** Текущий день для подписей «Сегодня» и «Вчера» */
	today?: string | number | Date
}

/** Условия автопрокрутки и подгрузки истории: что считать концом и началом ленты */
export interface ChatListScrollOptions {
	/** Есть ли разделитель «Непрочитанные»: лента открывается на нём, а не на конце */
	hasUnread: () => boolean
	/** Последнее сообщение — своё: после отправки лента прокручивается к нему, даже если читали историю */
	isLastOwn: () => boolean
	/** Меняется, когда в конце ленты что-то добавилось: новое сообщение или индикатор «печатает» */
	getEndKey: () => unknown
	/** Идентификатор последнего сообщения */
	getLastId: () => string | undefined
	/** Плавная ли прокрутка */
	isSmooth: () => boolean
	/** Идентификатор первого сообщения: когда он сменился, а прежний первый ниже, сверху добавилась история */
	getFirstId: () => string | undefined
	/** Есть ли сообщение с таким id в ленте не первым */
	hasIdBefore: (id: string) => boolean
	/** Нужна ли подгрузка: есть что подгружать и она ещё не идёт */
	canLoadMore: () => boolean
	/** Запросить более старые сообщения */
	onLoadMore: () => void
}
