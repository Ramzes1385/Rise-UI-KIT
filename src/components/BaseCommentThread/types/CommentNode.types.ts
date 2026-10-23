import type { CommentItem } from './BaseCommentThread.types'

/** Пропсы комментария в ветке */
export interface CommentNodeProps {
	/** Комментарий с ответами */
	comment: CommentItem
	/** Уровень: 0 — комментарий к ветке, 1 — ответ на него */
	depth: number
	/** Автор комментария, на который ответили: есть у ответов глубже `maxDepth`, которые идут без нового отступа */
	parentAuthor?: string
}
