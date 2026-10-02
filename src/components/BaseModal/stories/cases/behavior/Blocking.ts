import type meta from '../../BaseModal.stories'
import { BaseText } from '@components/BaseText'
import BaseModal from '../../../ui/BaseModal.vue'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import { screen, within, expect, waitFor } from 'storybook/test'
import { tabTo, storySource, useStorySetup } from '@/stories/helpers'

const OWN_ARGS = ['default', 'isOpen', 'onUpdate:isOpen']

const state = { isOpen: false }

const template = `
	<BaseButton variant="outline" @click="isOpen = true">Обновить приложение</BaseButton>
	<BaseModal v-bind="args" v-model:is-open="isOpen">
		<BaseText>Идёт перенос данных. Не закрывайте вкладку — после переноса окно можно будет закрыть.</BaseText>
		<template #footer>
			<BaseButton @click="isOpen = false">Готово</BaseButton>
		</template>
	</BaseModal>
`

export const Blocking: StoryObj<typeof meta> = {
	args: { closeOnEscape: false, closeOnOverlay: false, title: 'Обновление данных' },
	parameters: {
		docs: {
			description: {
				story: [
					'Блокирующий диалог: `closeOnEscape: false` и `closeOnOverlay: false`. Escape и клик по подложке окно не закрывают,',
					'Escape не достаётся и меню или поповеру под окном. Закрывают кнопка «Закрыть» в шапке и своя кнопка в подвале.',
				].join('\n'),
			},
			source: storySource({ template, imports: ['BaseModal', 'BaseButton', 'BaseText'], state, omit: OWN_ARGS }),
		},
		controls: { include: ['closeOnEscape', 'closeOnOverlay', 'hasOverlay'] },
	},
	tags: ['!autodocs'],
	render: args => ({
		components: { BaseModal, BaseButton, BaseText },
		setup: useStorySetup(args, { state, slots: OWN_ARGS }),
		template,
	}),
	play: async ({ canvas, userEvent }) => {
		const trigger = canvas.getByRole('button', { name: 'Обновить приложение' })
		await userEvent.click(trigger)
		const dialog = await screen.findByRole('dialog', { name: 'Обновление данных' })
		await waitFor(() => expect(dialog).toContainElement(document.activeElement as HTMLElement))

		await userEvent.keyboard('{Escape}')
		await expect(dialog).toBeInTheDocument()

		await userEvent.click(dialog.parentElement as HTMLElement)
		await expect(dialog).toBeInTheDocument()

		await tabTo(within(dialog).getByRole('button', { name: 'Готово' }), userEvent)
		await userEvent.keyboard('{Enter}')
		await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
		await expect(trigger).toHaveFocus()
	},
}
