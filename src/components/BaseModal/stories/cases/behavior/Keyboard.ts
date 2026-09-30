import type meta from '../../BaseModal.stories'
import BaseModal from '../../../ui/BaseModal.vue'
import { BaseInput } from '@components/BaseInput'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import { screen, within, waitFor, expect } from 'storybook/test'
import { storySource, tabTo, useStorySetup } from '@/stories/helpers'

const OWN_ARGS = ['default', 'isOpen', 'title', 'onUpdate:isOpen']

const state = { isOpen: false, name: 'Сайт студии' }

const template = `
	<BaseButton variant="outline" @click="isOpen = true">Переименовать</BaseButton>
	<BaseModal v-bind="args" v-model:is-open="isOpen" title="Переименовать проект">
		<BaseInput v-model="name" label="Название" />
		<template #footer>
			<BaseButton variant="outline" @click="isOpen = false">Отмена</BaseButton>
			<BaseButton @click="isOpen = false">Сохранить</BaseButton>
		</template>
	</BaseModal>
`

export const Keyboard: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Клавиатура: Enter на кнопке открывает окно и переводит фокус внутрь, Tab и Shift+Tab обходят элементы окна',
					'по кругу и не уходят на страницу, Escape закрывает окно и возвращает фокус на кнопку.',
				].join('\n'),
			},
			source: storySource({ template, imports: ['BaseModal', 'BaseButton', 'BaseInput'], state, omit: OWN_ARGS }),
		},
	},
	tags: ['!autodocs'],
	render: args => ({
		components: { BaseModal, BaseButton, BaseInput },
		setup: useStorySetup(args, { state, slots: OWN_ARGS }),
		template,
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
