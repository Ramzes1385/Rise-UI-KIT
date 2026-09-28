import BaseApp from '../../ui/BaseApp.vue'
import type meta from '../BaseApp.stories'
import { defineComponent, ref } from 'vue'
import { BaseText } from '@components/BaseText'
import { useToast } from '@composables/useToast'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import { expect, screen, within, waitFor } from 'storybook/test'

const CommentList = defineComponent({
	components: { BaseButton, BaseText },
	setup() {
		const toast = useToast()
		const comments = ref(['Отличный кадр на 00:42', 'Звук в конце громче, чем в начале', 'Субтитры съезжают на 01:15'])
		function remove(comment: string) {
			const index = comments.value.indexOf(comment)
			comments.value.splice(index, 1)
			toast.add({
				title: 'Комментарий удалён',
				description: comment,
				duration: 6000,
				actions: [{ label: 'Вернуть', onClick: () => comments.value.splice(index, 0, comment) }],
			})
		}
		return { comments, remove }
	},
	template: `
		<ul class="story-stack" style="list-style: none; margin: 0; padding: 0;">
			<li v-for="comment in comments" :key="comment" class="story-row">
				<BaseText tag="span">{{ comment }}</BaseText>
				<BaseButton variant="ghost" :aria-label="'Удалить комментарий: ' + comment" @click="remove(comment)">Удалить</BaseButton>
			</li>
		</ul>
	`,
})

export const Actions: StoryObj<typeof meta> = {
	parameters: {
		controls: { include: ['toaster'] },
		docs: {
			description: {
				story: [
					'Кнопки действий: `actions: [{ label, onClick }]`. Нажатие выполняет действие и закрывает уведомление.',
					'Пока указатель над уведомлением или фокус на его кнопках, оно не закрывается.',
				].join('\n'),
			},
			source: {
				code: "toast.add({ title: 'Комментарий удалён', actions: [{ label: 'Вернуть', onClick: () => restore(comment) }] })",
			},
		},
	},
	render: args => ({
		components: { BaseApp, CommentList },
		setup: () => ({ args }),
		template: '<BaseApp v-bind="args"><CommentList /></BaseApp>',
	}),
	play: async ({ canvas, userEvent }) => {
		await userEvent.click(canvas.getByRole('button', { name: 'Удалить комментарий: Звук в конце громче, чем в начале' }))
		await expect(canvas.queryByText('Звук в конце громче, чем в начале')).not.toBeInTheDocument()

		const item = await screen.findByRole('status')
		await userEvent.click(within(item).getByRole('button', { name: 'Вернуть' }))
		await expect(await canvas.findByText('Звук в конце громче, чем в начале')).toBeInTheDocument()
		await waitFor(() => expect(screen.queryByRole('status')).not.toBeInTheDocument())
	},
}
