import { docsFrame } from '../../shared'
import { BaseButton } from '@components/BaseButton'
import type meta from '../../BasePopconfirm.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BasePopconfirm from '../../../ui/BasePopconfirm.vue'
import { storySource, useStorySetup } from '@/stories/helpers'
import { screen, waitFor, expect, within } from 'storybook/test'

const template = `
	<BasePopconfirm v-bind="args">
		<BaseButton variant="ghost">Удалить комментарий</BaseButton>
	</BasePopconfirm>
`

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
			source: storySource({ template, imports: ['BasePopconfirm', 'BaseButton'] }),
		},
	},
	render: args => ({
		components: { BasePopconfirm, BaseButton },
		setup: useStorySetup(args, { slots: [] }),
		template,
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
