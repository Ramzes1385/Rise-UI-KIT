import type { ComponentPublicInstance } from 'vue'
import { calcDerivedScale } from '@utils/media/iconUtils'
import { formatMessage, pluralize } from '@/locales/state'
import { formatRelativeTime } from '@utils/data/dateUtils'
import { computed, inject, nextTick, ref, useId } from 'vue'
import { UI_COMMENT_THREAD, UI_PLURAL } from '@/locales/messages'
import type { CommentNodeProps } from '../types/CommentNode.types'
import type { CommentThreadContext } from '../types/BaseCommentThread.types'
import { COMMENT_THREAD_KEY, countComments, isoDate, leaveAtOnce } from './thread/commentTree'

function useNodeTexts(props: CommentNodeProps, isCollapsed: () => boolean) {
	return {
		likeText: computed(() => (props.comment.likes ? `${UI_COMMENT_THREAD.LIKE} · ${props.comment.likes}` : UI_COMMENT_THREAD.LIKE)),
		repliesText: computed(() =>
			isCollapsed()
				? formatMessage(UI_COMMENT_THREAD.SHOW_REPLIES, {
						replies: pluralize(UI_PLURAL.REPLIES, countComments(props.comment.replies ?? [])),
					})
				: UI_COMMENT_THREAD.HIDE_REPLIES,
		),
		replyLabel: computed(() => formatMessage(UI_COMMENT_THREAD.REPLY_TO, { name: props.comment.author.name })),
	}
}

const COMPACT_SCALE_RATIO = 0.75

export function useCommentNode(props: CommentNodeProps) {
	const context = inject(COMMENT_THREAD_KEY) as CommentThreadContext
	const ownId = useId()
	const replyButtonRef = ref<ComponentPublicInstance | null>(null)
	const isCollapsed = computed(() => context.collapsed.value.has(props.comment.id))
	const focusReplyButton = (): Promise<void> => nextTick(() => (replyButtonRef.value?.$el as HTMLElement | undefined)?.focus())
	return {
		...useNodeTexts(props, () => isCollapsed.value),
		ui: context.ui,
		isMotionReduced: computed(() => context.isMotionReduced()),
		leaveAtOnce,
		authorId: `${ownId}-author`,
		repliesId: `${ownId}-replies`,
		replyButtonRef,
		replies: computed(() => props.comment.replies ?? []),
		isCollapsed,
		isReplying: computed(() => context.replyTo.value === props.comment.id),
		isReadonly: computed(() => context.isReadonly()),
		isFlat: computed(() => props.depth + 1 >= context.maxDepth()),
		sizeScale: computed(() => context.sizeScale()),
		compactScale: computed(() => calcDerivedScale(context.sizeScale(), COMPACT_SCALE_RATIO)),
		time: computed(() => formatRelativeTime(props.comment.date, { now: context.now() })),
		iso: computed(() => isoDate(props.comment.date)),
		openReply: (): void => context.openReply(props.comment.id),
		toggleLike: (): void => context.toggleLike(props.comment),
		toggleReplies: (): void => context.toggleReplies(props.comment.id),
		cancelReply(): void {
			context.closeReply()
			void focusReplyButton()
		},
		submitReply(text: string): void {
			context.submitReply(props.comment.id, text)
			void focusReplyButton()
		},
	}
}
