import type meta from '../../BaseModal.stories'
import { BaseText } from '@components/BaseText'
import BaseModal from '../../../ui/BaseModal.vue'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import { screen, expect, waitFor } from 'storybook/test'
import { storySource, useStorySetup } from '@/stories/helpers'

const OWN_ARGS = ['default', 'isOpen', 'onUpdate:isOpen']

const state = { isOpen: false }

const template = `
	<BaseButton variant="outline" @click="isOpen = true">Отправить на согласование</BaseButton>
	<BaseModal v-bind="args" v-model:is-open="isOpen">
		<BaseText>После отправки редактировать документ нельзя, пока согласование не завершится.</BaseText>
		<template #footer>
			<BaseButton variant="outline" @click="isOpen = false">Отмена</BaseButton>
			<BaseButton @click="isOpen = false">Отправить</BaseButton>
		</template>
	</BaseModal>
`

export const NoOverlayClose: StoryObj<typeof meta> = {
	args: { closeOnOverlay: false, title: 'Отправить на согласование?' },
	parameters: {
		docs: {
			description: {
				story: [
					'Подтверждение, которое нельзя закрыть случайным кликом: `closeOnOverlay: false`. Клик по подложке окно не закрывает,',
					'Escape и кнопка «Закрыть» — закрывают.',
				].join('\n'),
			},
			source: storySource({ template, imports: ['BaseModal', 'BaseButton', 'BaseText'], state, omit: OWN_ARGS }),
		},
		controls: { include: ['closeOnOverlay', 'hasOverlay'] },
	},
	render: args => ({
		components: { BaseModal, BaseButton, BaseText },
		setup: useStorySetup(args, { state, slots: OWN_ARGS }),
		template,
	}),
	play: async ({ canvas, userEvent }) => {
		await userEvent.click(canvas.getByRole('button', { name: 'Отправить на согласование' }))
		const dialog = await screen.findByRole('dialog', { name: 'Отправить на согласование?' })

		await userEvent.click(dialog.parentElement as HTMLElement)
		await expect(dialog).toBeInTheDocument()

		await userEvent.keyboard('{Escape}')
		await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
	},
}
