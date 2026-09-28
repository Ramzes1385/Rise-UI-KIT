import { docsFrame } from '../shared'
import type meta from '../BasePopconfirm.stories'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import { useArgsWithoutSlots } from '@/stories/helpers'
import BasePopconfirm from '../../ui/BasePopconfirm.vue'
import { screen, waitFor, expect, within } from 'storybook/test'

export const Danger: StoryObj<typeof meta> = {
	args: { title: 'Удалить комментарий?', description: 'Ответы на него тоже удалятся.', confirmLabel: 'Удалить', isDanger: true },
	parameters: {
		docs: {
			...docsFrame(260),
			description: {
				story: [
					'Необратимое действие (`isDanger`): значок предупреждения, кнопка цвета ошибки, фокус при открытии —',
					'на «Отмене», чтобы случайный Enter ничего не удалил.',
				].join('\n'),
			},
		},
	},
	render: args => ({
		components: { BasePopconfirm, BaseButton },
		setup: () => ({ props: useArgsWithoutSlots(args, []) }),
		template: `
			<BasePopconfirm v-bind="props">
				<BaseButton variant="ghost">Удалить комментарий</BaseButton>
			</BasePopconfirm>
		`,
	}),
	play: async ({ canvas, userEvent, args }) => {
		await userEvent.click(canvas.getByRole('button', { name: 'Удалить комментарий' }))
		const dialog = await screen.findByRole('alertdialog', { name: 'Удалить комментарий?' })
		await waitFor(() => expect(within(dialog).getByRole('button', { name: 'Отмена' })).toHaveFocus())

		await userEvent.keyboard('{Enter}')
		await expect(args.onCancel).toHaveBeenCalledOnce()
		await expect(args.onConfirm).not.toHaveBeenCalled()
	},
}
