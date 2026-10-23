import { tabTo } from '@/stories/helpers'
import { expect, fn } from 'storybook/test'
import type meta from '../BaseCommentThread.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const Default: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: 'Ветка с ответами трёх уровней и полем нового комментария. Проверка отвечает Олегу с клавиатуры: Tab, Enter, текст, Ctrl+Enter.',
			},
		},
	},
	args: { onReply: fn(), onLike: fn() },
	play: async ({ canvas, userEvent, args }) => {
		const reply = canvas.getAllByRole('button', { name: 'Ответить' }).at(-1) as HTMLElement
		await tabTo(reply, userEvent)
		await userEvent.keyboard('{Enter}')
		const field = canvas.getByRole('textbox', { name: 'Ответ пользователю Олег Соколов' })
		await expect(field).toHaveFocus()
		await userEvent.type(field, 'Посмотрю метрики в пятницу')
		await userEvent.keyboard('{Control>}{Enter}{/Control}')
		await expect(args.onReply).toHaveBeenCalledWith({ parentId: 'c5', text: 'Посмотрю метрики в пятницу' })
		await expect(reply).toHaveFocus()
		await userEvent.click(canvas.getAllByRole('button', { name: /^Нравится/ })[0])
		await expect(args.onLike).toHaveBeenCalledWith({ id: 'c1', isLiked: false })
	},
}
