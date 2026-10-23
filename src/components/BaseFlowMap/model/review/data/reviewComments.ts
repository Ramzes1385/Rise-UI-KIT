import type { CommentItem } from '@components/BaseCommentThread'
import type { ReviewNewComment, ReviewThreadLike } from '../../../types/internal/review/reviewCore.types'

function nextReviewId(prefix: string, used: Iterable<string>): string {
	const taken = new Set(used)
	let index = taken.size + 1
	while (taken.has(`${prefix}${index}`)) index += 1
	return `${prefix}${index}`
}

function collectIds(items: readonly CommentItem[]): string[] {
	return items.flatMap(item => [item.id, ...collectIds(item.replies ?? [])])
}

function allCommentIds(threads: readonly ReviewThreadLike[]): string[] {
	return threads.flatMap(thread => [thread.id, ...collectIds(thread.comments)])
}

function withReply(items: readonly CommentItem[], parentId: string, reply: CommentItem): CommentItem[] {
	return items.map(item => {
		if (item.id === parentId) return { ...item, replies: [...(item.replies ?? []), reply] }
		return item.replies ? { ...item, replies: withReply(item.replies, parentId, reply) } : item
	})
}

function toComment<T extends ReviewThreadLike>(threads: readonly T[], input: ReviewNewComment): CommentItem {
	return { id: nextReviewId('c', allCommentIds(threads)), author: input.author, text: input.text.trim(), date: input.date }
}

export function addComment<T extends ReviewThreadLike>(
	threads: readonly T[],
	target: { threadId: string; parentId?: string | null },
	input: ReviewNewComment,
): T[] {
	const comment = toComment(threads, input)
	return threads.map(thread => {
		if (thread.id !== target.threadId) return thread
		const comments = target.parentId ? withReply(thread.comments, target.parentId, comment) : [...thread.comments, comment]
		return { ...thread, comments, isResolved: false }
	})
}

export function createThread<T extends ReviewThreadLike>(
	threads: readonly T[],
	base: Omit<T, 'id' | 'comments'>,
	input: ReviewNewComment,
): T[] {
	const id = nextReviewId('t', allCommentIds(threads))
	const comment = toComment(threads, input)
	return [...threads, { ...base, id, comments: [comment], isUnread: false } as unknown as T]
}

function patchThread<T extends ReviewThreadLike>(threads: readonly T[], id: string, patch: Partial<ReviewThreadLike>): T[] {
	return threads.map(thread => (thread.id === id ? { ...thread, ...patch } : thread))
}

export function setThreadResolved<T extends ReviewThreadLike>(threads: readonly T[], id: string, isResolved: boolean): T[] {
	return patchThread(threads, id, { isResolved })
}

export function markThreadRead<T extends ReviewThreadLike>(threads: readonly T[], id: string): T[] {
	return patchThread(threads, id, { isUnread: false })
}

export function countUnread(threads: readonly ReviewThreadLike[]): number {
	return threads.filter(thread => thread.isUnread && !thread.isResolved).length
}

export function visibleThreads<T extends ReviewThreadLike>(threads: readonly T[], isResolvedShown: boolean): T[] {
	return isResolvedShown ? [...threads] : threads.filter(thread => !thread.isResolved)
}

export function commentCount(items: readonly CommentItem[]): number {
	return items.reduce((sum, item) => sum + 1 + commentCount(item.replies ?? []), 0)
}

export function latestComment(thread: ReviewThreadLike): CommentItem | undefined {
	return thread.comments[thread.comments.length - 1]
}
