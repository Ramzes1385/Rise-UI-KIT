import { ref } from 'vue'
import type meta from '../BaseModal.stories'
import BaseModal from '../../ui/BaseModal.vue'
import { BaseInput } from '@components/BaseInput'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import { useArgsWithoutSlots, tabTo } from '@/stories/helpers'
import { screen, within, waitFor, expect } from 'storybook/test'

export const Keyboard: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Клавиатура: Enter на кнопке открывает окно и переводит фокус внутрь, Tab и Shift+Tab обходят элементы окна',
					'по кругу и не уходят на страницу, Escape закрывает окно и возвращает фокус на кнопку.',
				].join('\n'),
			},
		},
	},
	tags: ['!autodocs'],
	render: args => ({
		components: { BaseModal, BaseButton, BaseInput },
		setup: () => ({
			props: useArgsWithoutSlots(args, ['default', 'isOpen', 'title', 'onUpdate:isOpen']),
			isOpen: ref(false),
			name: ref('Сайт студии'),
		}),
		template: `
			<BaseButton variant="outline" @click="isOpen = true">Переименовать</BaseButton>
			<BaseModal v-bind="props" v-model:is-open="isOpen" title="Переименовать проект">
				<BaseInput v-model="name" label="Название" />
				<template #footer>
					<BaseButton variant="outline" @click="isOpen = false">Отмена</BaseButton>
					<BaseButton @click="isOpen = false">Сохранить</BaseButton>
				</template>
			</BaseModal>
		`,
	}),
	play: async ({ canvas, userEvent }) => {
		const trigger = canvas.getByRole('button', { name: 'Переименовать' })
		await tabTo(trigger, userEvent)
		await userEvent.keyboard('{Enter}')

		const dialog = await screen.findByRole('dialog', { name: 'Переименовать проект' })
		const close = within(dialog).getByRole('button', { name: 'Закрыть' })
		await waitFor(() => expect(close).toHaveFocus())

		await userEvent.tab()
		await expect(within(dialog).getByLabelText('Название')).toHaveFocus()
		await userEvent.tab()
		await userEvent.tab()
		await expect(within(dialog).getByRole('button', { name: 'Сохранить' })).toHaveFocus()
		await userEvent.tab()
		await expect(close).toHaveFocus()
		await userEvent.tab({ shift: true })
		await expect(within(dialog).getByRole('button', { name: 'Сохранить' })).toHaveFocus()

		await userEvent.keyboard('{Escape}')
		await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
		await expect(trigger).toHaveFocus()
	},
}
