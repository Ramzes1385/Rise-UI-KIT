import { ref } from 'vue'
import { expect } from 'storybook/test'
import type meta from '../BaseCommentThread.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseCommentThread from '../../ui/BaseCommentThread.vue'
import { CURRENT_USER, SAMPLE_COMMENTS } from '../sampleComments'
import { literal, staticStorySource, STORY_TODAY } from '@/stories/helpers'
import type { CommentItem, CommentReply } from '../../types/BaseCommentThread.types'

function insertReply(comments: CommentItem[], reply: CommentItem, parentId: string | null): CommentItem[] {
	if (parentId === null) return [...comments, reply]
	return comments.map(comment =>
		comment.id === parentId
			? { ...comment, replies: [...(comment.replies ?? []), reply] }
			: { ...comment, replies: insertReply(comment.replies ?? [], reply, parentId) },
	)
}

function toggleLike(comments: CommentItem[], id: string, isLiked: boolean): CommentItem[] {
	return comments.map(comment =>
		comment.id === id
			? { ...comment, isLiked, likes: (comment.likes ?? 0) + (isLiked ? 1 : -1) }
			: { ...comment, replies: toggleLike(comment.replies ?? [], id, isLiked) },
	)
}

const template = `
	<div style="max-width: 640px">
		<BaseCommentThread :comments="comments" :current-user="currentUser" :now="now" @reply="onReply" @like="onLike" />
	</div>
`

const script = `
const comments = ref<CommentItem[]>(${literal(SAMPLE_COMMENTS)})
const currentUser = ${literal(CURRENT_USER)}
const now = ${literal(STORY_TODAY)}
let counter = 0

function insertReply(comments: CommentItem[], reply: CommentItem, parentId: string | null): CommentItem[] {
	if (parentId === null) return [...comments, reply]
	return comments.map(comment =>
		comment.id === parentId
			? { ...comment, replies: [...(comment.replies ?? []), reply] }
			: { ...comment, replies: insertReply(comment.replies ?? [], reply, parentId) },
	)
}

function toggleLike(comments: CommentItem[], id: string, isLiked: boolean): CommentItem[] {
	return comments.map(comment =>
		comment.id === id
			? { ...comment, isLiked, likes: (comment.likes ?? 0) + (isLiked ? 1 : -1) }
			: { ...comment, replies: toggleLike(comment.replies ?? [], id, isLiked) },
	)
}

function onReply({ parentId, text }: CommentReply): void {
	counter += 1
	const reply = { id: \`new-\${counter}\`, author: currentUser, text, date: now }
	comments.value = insertReply(comments.value, reply, parentId)
}

function onLike({ id, isLiked }: { id: string; isLiked: boolean }): void {
	comments.value = toggleLike(comments.value, id, isLiked)
}
`

export const Live: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: 'Ветка с данными в приложении: обработчики `reply` и `like` добавляют ответ в нужное место дерева и меняют счётчик.',
			},
			source: staticStorySource({
				template,
				imports: ['BaseCommentThread', 'type CommentItem', 'type CommentReply'],
				vue: ['ref'],
				script,
			}),
		},
		controls: { disable: true },
	},
	render: () => ({
		components: { BaseCommentThread },
		setup: () => {
			const comments = ref(SAMPLE_COMMENTS)
			let counter = 0
			return {
				comments,
				currentUser: CURRENT_USER,
				now: STORY_TODAY,
				onReply({ parentId, text }: CommentReply): void {
					counter += 1
					const reply = { id: `new-${counter}`, author: CURRENT_USER, text, date: STORY_TODAY }
					comments.value = insertReply(comments.value, reply, parentId)
				},
				onLike({ id, isLiked }: { id: string; isLiked: boolean }): void {
					comments.value = toggleLike(comments.value, id, isLiked)
				},
			}
		},
		template,
	}),
	play: async ({ canvas, userEvent }) => {
		await userEvent.type(canvas.getByRole('textbox', { name: 'Новый комментарий' }), 'Готова помочь с тестами')
		await userEvent.click(canvas.getByRole('button', { name: 'Отправить' }))
		await expect(canvas.getByText('Готова помочь с тестами')).toBeVisible()
		await expect(canvas.getByText('6 комментариев')).toBeVisible()
		await userEvent.click(canvas.getByRole('button', { name: 'Нравится · 1' }))
		await expect(canvas.getByRole('button', { name: 'Нравится · 2' })).toHaveAttribute('aria-pressed', 'true')
	},
}
