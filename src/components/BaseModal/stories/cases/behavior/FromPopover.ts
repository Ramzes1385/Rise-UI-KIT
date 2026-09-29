import { ref } from 'vue'
import type meta from '../../BaseModal.stories'
import { BaseText } from '@components/BaseText'
import { screen, expect } from 'storybook/test'
import BaseModal from '../../../ui/BaseModal.vue'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import { BasePopover } from '@components/BasePopover'
import { useArgsWithoutSlots } from '@/stories/helpers'

export const FromPopover: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Окно из открытого поповера: окно открыто позже и поэтому выше поповера, хотя поповер смонтирован раньше',
					'и его якорь в DOM стоит перед окном. Порядок наложения — порядок открытия (`--rise-layer-index`).',
				].join('\n'),
			},
		},
	},
	tags: ['!autodocs'],
	render: args => ({
		components: { BaseModal, BaseButton, BasePopover, BaseText },
		setup: () => ({
			props: useArgsWithoutSlots(args, ['default', 'isOpen', 'title', 'onUpdate:isOpen']),
			isPopoverOpen: ref(true),
			isModalOpen: ref(false),
		}),
		template: `
			<BasePopover v-model:is-open="isPopoverOpen" position="bottom">
				<template #trigger>
					<BaseButton variant="outline">Серия 3</BaseButton>
				</template>
				<div class="story-stack" style="width: 240px;">
					<BaseText>Опубликована 12 сентября</BaseText>
					<BaseButton variant="soft" @click="isModalOpen = true">Снять с публикации…</BaseButton>
				</div>
			</BasePopover>
			<BaseModal v-bind="props" v-model:is-open="isModalOpen" title="Снять серию с публикации?">
				<BaseText>Подписчики перестанут видеть серию 3, ссылки на неё перестанут открываться.</BaseText>
				<template #footer>
					<BaseButton variant="outline" @click="isModalOpen = false">Отмена</BaseButton>
					<BaseButton @click="isModalOpen = false">Снять</BaseButton>
				</template>
			</BaseModal>
		`,
	}),
	play: async ({ userEvent }) => {
		const action = await screen.findByRole('button', { name: 'Снять с публикации…' })
		const popoverLayer = action.closest('.base-dropdown__panel') as HTMLElement
		await userEvent.click(action)

		const dialog = await screen.findByRole('dialog', { name: 'Снять серию с публикации?' })
		const modalLayer = dialog.closest('.base-modal') as HTMLElement
		await expect(Number(getComputedStyle(modalLayer).zIndex)).toBeGreaterThan(Number(getComputedStyle(popoverLayer).zIndex))
	},
}
