import { pluralize } from '@/locales/state'
import { UI_PLURAL } from '@/locales/messages'
import { useUi } from '@composables/base/useUi'
import { useMotion } from '@composables/app/useMotion'
import { computed, provide, ref, shallowRef } from 'vue'
import { useStructuredData } from '@composables/seo/useStructuredData'
import { useStandardBaseComponent } from '@composables/base/useBaseComponent'
import type { StructuredDataContext } from '@composables/seo/useStructuredData'
import type { StructuredData, StructuredDataObject } from '@utils/seo/structuredDataUtils'
import { COMMENT_THREAD_KEY, countComments, isoDate, leaveAtOnce } from './thread/commentTree'
import type { CommentItem, CommentThreadProps, BaseCommentThreadEmits } from '../types/BaseCommentThread.types'

function toggled(set: ReadonlySet<string>, id: string): ReadonlySet<string> {
	const next = new Set(set)
	if (next.has(id)) next.delete(id)
	else next.add(id)
	return next
}

function commentSchema(comment: CommentItem, url: StructuredDataContext['url']): StructuredDataObject {
	return {
		'@type': 'Comment',
		text: comment.text,
		datePublished: isoDate(comment.date),
		author: { '@type': 'Person', name: comment.author.name, image: url(comment.author.avatar) },
		upvoteCount: comment.likes,
		comment: comment.replies?.length ? comment.replies.map(reply => commentSchema(reply, url)) : undefined,
	}
}

function threadSchema(comments: CommentItem[], { url }: StructuredDataContext): StructuredData | null {
	if (!comments.length) return null
	return { '@type': 'WebPage', commentCount: countComments(comments), comment: comments.map(comment => commentSchema(comment, url)) }
}

export function useBaseCommentThread(props: CommentThreadProps, emit: BaseCommentThreadEmits) {
	const replyTo = ref<string | null>(null)
	const collapsed = shallowRef<ReadonlySet<string>>(new Set())
	const rootRef = ref<HTMLElement | null>(null)
	const motion = useMotion(rootRef)
	const ui = useUi(props, 'base-comment-thread')
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
		isMotionReduced: () => motion.isReduced.value,
		ui,
	})
	return {
		rootRef,
		ui,
		isMotionReduced: motion.isReduced,
		leaveAtOnce,
		...useStandardBaseComponent('base-comment-thread', props, ['root', 'list', 'composer']),
		countText: computed(() => pluralize(UI_PLURAL.COMMENTS, countComments(props.comments))),
		...useStructuredData(
			'BaseCommentThread',
			() => props.seo,
			context => threadSchema(props.comments, context),
		),
		submitRoot: (text: string): void => emit('reply', { parentId: null, text }),
	}
}
