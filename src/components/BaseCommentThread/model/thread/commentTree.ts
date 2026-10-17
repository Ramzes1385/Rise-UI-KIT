import type { InjectionKey } from 'vue'
import type { CommentItem, CommentThreadContext } from '../../types/BaseCommentThread.types'

export const COMMENT_THREAD_KEY: InjectionKey<CommentThreadContext> = Symbol('rise-ui-kit.comment-thread')

export const countComments = (comments: readonly CommentItem[]): number =>
	comments.reduce((sum, comment) => sum + 1 + countComments(comment.replies ?? []), 0)

export function isoDate(date: CommentItem['date']): string | undefined {
	const time = new Date(date)
	return Number.isNaN(time.getTime()) ? undefined : time.toISOString()
}

export const leaveAtOnce = (_el: Element, done: () => void): void => done()
