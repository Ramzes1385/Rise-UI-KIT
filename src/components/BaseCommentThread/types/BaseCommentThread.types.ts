import type { Ref } from 'vue'
import type { PropsWithDefaults } from '@composables/base/useDefaults'
import type { BaseComponentProps } from '@composables/base/useBaseComponent'

/** Варианты оформления BaseCommentThread: default — панель с рамкой и отступами, ghost — без рамки и фона. */
export const COMMENT_THREAD_VARIANTS = ['default', 'ghost'] as const

/** Автор комментария */
export interface CommentAuthor {
	/** Имя: подпись и инициалы, если нет картинки */
	name: string
	/** Картинка-аватар */
	avatar?: string
}

/** Комментарий с ответами */
export interface CommentItem {
	/** Уникальный id */
	id: string
	/** Автор */
	author: CommentAuthor
	/** Текст: переносы строк сохраняются */
	text: string
	/** Когда: Date, ISO-строка или время в мс; показывается как «5 минут назад» */
	date: Date | string | number
	/** Сколько отметок «Нравится» */
	likes?: number
	/** Текущий пользователь отметил «Нравится» */
	isLiked?: boolean
	/** Ответы */
	replies?: CommentItem[]
}

/** Новый комментарий: parentId — id комментария, на который отвечают; null — комментарий к ветке */
export interface CommentReply {
	parentId: string | null
	text: string
}

/** Общие данные и действия ветки для вложенных комментариев */
export interface CommentThreadContext {
	now: () => Date | undefined
	maxDepth: () => number
	isReadonly: () => boolean
	sizeScale: () => number
	replyTo: Ref<string | null>
	collapsed: Ref<ReadonlySet<string>>
	openReply: (id: string) => void
	closeReply: () => void
	submitReply: (parentId: string, text: string) => void
	toggleLike: (comment: CommentItem) => void
	toggleReplies: (id: string) => void
}

/**
 * Пропсы компонента BaseCommentThread
 */
export interface BaseCommentThreadProps extends BaseComponentProps<(typeof COMMENT_THREAD_VARIANTS)[number], 'root' | 'list' | 'composer'> {
	/** Комментарии с ответами; новые комментарии и отметки «Нравится» приложение добавляет по событиям `reply` и `like` */
	comments: CommentItem[]
	/** Текущий пользователь: аватар у поля нового комментария */
	currentUser?: CommentAuthor
	/** Имя ветки для скринридера; по умолчанию «Комментарии» */
	label?: string
	/** «Сейчас» для относительного времени; по умолчанию — время отрисовки */
	now?: Date
	/** Глубже этого уровня ответы идут без нового отступа */
	maxDepth?: number
	/** Только чтение: без поля нового комментария и кнопок «Ответить» */
	isReadonly?: boolean
}

/**
 * События компонента BaseCommentThread
 */
export interface BaseCommentThreadEmits {
	/** Новый комментарий или ответ */
	(event: 'reply', value: CommentReply): void
	/** «Нравится» нажато или снято */
	(event: 'like', value: { id: string; isLiked: boolean }): void
}

/** Пропсы после значений по умолчанию */
export type CommentThreadProps = PropsWithDefaults<BaseCommentThreadProps, 'maxDepth'>
