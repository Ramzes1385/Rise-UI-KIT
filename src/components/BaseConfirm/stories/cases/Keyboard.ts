import type meta from '../BaseConfirm.stories'
import BaseConfirm from '../../ui/BaseConfirm.vue'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import { screen, within, waitFor, expect } from 'storybook/test'
import { storySource, tabTo, useStorySetup } from '@/stories/helpers'

const state = { isOpen: false }

const template = `
	<BaseButton variant="outline" @click="isOpen = true">Удалить проект</BaseButton>
	<BaseConfirm v-bind="args" v-model:is-open="isOpen" />
`

export const Keyboard: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Клавиатура: Enter на кнопке открывает окно с фокусом на «Отмене» (`isDanger`), Tab переходит к «Удалить»',
					'и не уходит из окна, Escape отменяет и возвращает фокус на кнопку.',
				].join('\n'),
			},
			source: storySource({ template, imports: ['BaseConfirm', 'BaseButton'], state, omit: ['isOpen', 'onUpdate:isOpen'] }),
		},
	},
	tags: ['!autodocs'],
	args: {
		isDanger: true,
		title: 'Удалить проект «Сайт студии»?',
		description: 'Проект, 48 файлов и история правок удалятся без возможности восстановления.',
		confirmLabel: 'Удалить',
	},
	render: args => ({
		components: { BaseConfirm, BaseButton },
		setup: useStorySetup(args, { state, slots: ['isOpen', 'onUpdate:isOpen'] }),
		template,
	}),
	play: async ({ canvas, userEvent, args }) => {
		const trigger = canvas.getByRole('button', { name: 'Удалить проект' })
		await tabTo(trigger, userEvent)
		await userEvent.keyboard('{Enter}')

		const dialog = await screen.findByRole('alertdialog', { name: 'Удалить проект «Сайт студии»?' })
		const cancel = within(dialog).getByRole('button', { name: 'Отмена' })
		await waitFor(() => expect(cancel).toHaveFocus())
		await expect(getComputedStyle(cancel).outlineStyle).toBe('solid')

		await userEvent.tab()
		await expect(within(dialog).getByRole('button', { name: 'Удалить' })).toHaveFocus()
		await userEvent.tab()
		await expect(within(dialog).getByRole('button', { name: 'Закрыть' })).toHaveFocus()

		await userEvent.keyboard('{Escape}')
		await waitFor(() => expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument())
		await expect(trigger).toHaveFocus()
		await expect(args.onClose).toHaveBeenCalledWith(false)
		await expect(args.onCancel).toHaveBeenCalledOnce()
	},
}
