import { getLocale, pluralize } from '@/locales/state'
import { computed, provide, ref, shallowRef } from 'vue'
import { COMMENT_THREAD_KEY, countComments } from './thread/commentTree'
import { useStandardBaseComponent } from '@composables/base/useBaseComponent'
import type { CommentThreadProps, BaseCommentThreadEmits } from '../types/BaseCommentThread.types'

function toggled(set: ReadonlySet<string>, id: string): ReadonlySet<string> {
	const next = new Set(set)
	if (next.has(id)) next.delete(id)
	else next.add(id)
	return next
}

export function useBaseCommentThread(props: CommentThreadProps, emit: BaseCommentThreadEmits) {
	const replyTo = ref<string | null>(null)
	const collapsed = shallowRef<ReadonlySet<string>>(new Set())
	provide(COMMENT_THREAD_KEY, {
		now: () => props.now,
		maxDepth: () => props.maxDepth,
		isReadonly: () => Boolean(props.isReadonly),
		sizeScale: () => props.sizeScale ?? 100,
		replyTo,
		collapsed,
		openReply: id => (replyTo.value = id),
		closeReply: () => (replyTo.value = null),
		submitReply: (parentId, text) => {
			emit('reply', { parentId, text })
			replyTo.value = null
		},
		toggleLike: comment => emit('like', { id: comment.id, isLiked: !comment.isLiked }),
		toggleReplies: id => (collapsed.value = toggled(collapsed.value, id)),
	})
	return {
		...useStandardBaseComponent('base-comment-thread', props, ['root', 'list', 'composer']),
		countText: computed(() => pluralize(getLocale().plural.COMMENTS, countComments(props.comments))),
		submitRoot: (text: string): void => emit('reply', { parentId: null, text }),
	}
}
