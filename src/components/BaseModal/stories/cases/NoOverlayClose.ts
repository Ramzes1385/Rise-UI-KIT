import { ref } from 'vue'
import type meta from '../BaseModal.stories'
import BaseModal from '../../ui/BaseModal.vue'
import { BaseText } from '@components/BaseText'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import { useArgsWithoutSlots } from '@/stories/helpers'
import { screen, expect, waitFor } from 'storybook/test'

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
		},
		controls: { include: ['closeOnOverlay', 'hasOverlay'] },
	},
	render: args => ({
		components: { BaseModal, BaseButton, BaseText },
		setup: () => ({ props: useArgsWithoutSlots(args, ['default', 'isOpen', 'onUpdate:isOpen']), isOpen: ref(false) }),
		template: `
			<BaseButton variant="outline" @click="isOpen = true">Отправить на согласование</BaseButton>
			<BaseModal v-bind="props" v-model:is-open="isOpen">
				<BaseText>После отправки редактировать документ нельзя, пока согласование не завершится.</BaseText>
				<template #footer>
					<BaseButton variant="outline" @click="isOpen = false">Отмена</BaseButton>
					<BaseButton @click="isOpen = false">Отправить</BaseButton>
				</template>
			</BaseModal>
		`,
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
