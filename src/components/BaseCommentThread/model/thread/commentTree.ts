import type { InjectionKey } from 'vue'
import type { CommentItem, CommentThreadContext } from '../../types/BaseCommentThread.types'

export const COMMENT_THREAD_KEY: InjectionKey<CommentThreadContext> = Symbol('rise-ui-kit.comment-thread')

export const countComments = (comments: readonly CommentItem[]): number =>
	comments.reduce((sum, comment) => sum + 1 + countComments(comment.replies ?? []), 0)
