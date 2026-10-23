import '@testing-library/jest-dom/vitest'
import { h, ref } from 'vue'
import BaseCommentThread from '../ui/BaseCommentThread.vue'
import { fireEvent, render, screen } from '@testing-library/vue'
import type { CommentItem, CommentReply } from '../types/BaseCommentThread.types'

describe('BaseCommentThread integration', () => {
	it('ответ, добавленный приложением по событию reply, появляется в ветке', async () => {
		const comments = ref<CommentItem[]>([{ id: 'a', author: { name: 'Анна' }, text: 'Вопрос', date: 0 }])
		render({
			setup: () => () =>
				h(BaseCommentThread, {
					comments: comments.value,
					onReply: ({ parentId, text }: CommentReply) => {
						comments.value = comments.value.map(comment =>
							comment.id === parentId
								? { ...comment, replies: [{ id: 'b', author: { name: 'Иван' }, text, date: 0 }] }
								: comment,
						)
					},
				}),
		})
		await fireEvent.click(screen.getByRole('button', { name: 'Ответить' }))
		await fireEvent.update(screen.getByRole('textbox', { name: 'Ответ пользователю Анна' }), 'Ответ')
		await fireEvent.click(screen.getAllByRole('button', { name: 'Отправить' })[0])
		expect(screen.getByRole('article', { name: 'Иван' })).toHaveTextContent('Ответ')
		expect(screen.getByText('2 комментария')).toBeInTheDocument()
	})
})
