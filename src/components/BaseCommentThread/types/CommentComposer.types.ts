import type { CommentAuthor } from './BaseCommentThread.types'

/** Пропсы поля комментария */
export interface CommentComposerProps {
	/** Имя поля для скринридера */
	label: string
	/** Подсказка в пустом поле */
	placeholder?: string
	/** Ответ на комментарий: фокус при открытии, кнопка «Отмена» и Escape */
	isReply?: boolean
	/** Автор: аватар слева */
	author?: CommentAuthor
	/** Масштаб */
	sizeScale: number
}

/** События поля комментария */
export interface CommentComposerEmits {
	/** Текст без пробелов по краям */
	(event: 'submit', text: string): void
	/** Ответ отменён */
	(event: 'cancel'): void
}
