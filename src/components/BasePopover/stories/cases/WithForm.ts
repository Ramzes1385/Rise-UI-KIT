import { ref } from 'vue'
import { SHOWCASE_OWN_ARGS } from '../shared'
import type meta from '../BasePopover.stories'
import { BaseInput } from '@components/BaseInput'
import BasePopover from '../../ui/BasePopover.vue'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import { useArgsWithoutSlots } from '@/stories/helpers'
import { screen, expect, within, waitFor } from 'storybook/test'

export const WithForm: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Форма в поповере: поле получает фокус и ввод, кнопка отправляет форму и закрывает поповер.',
					'После закрытия фокус возвращается на кнопку-триггер.',
				].join('\n'),
			},
		},
		controls: { include: ['position', 'variant'] },
	},
	render: args => ({
		components: { BasePopover, BaseButton, BaseInput },
		setup: () => ({ props: useArgsWithoutSlots(args, [...SHOWCASE_OWN_ARGS]), isOpen: ref(false), email: ref('') }),
		template: `
			<BasePopover v-bind="props" v-model:is-open="isOpen">
				<template #trigger>
					<BaseButton variant="outline">Пригласить</BaseButton>
				</template>
				<form class="story-col" aria-label="Приглашение" @submit.prevent="isOpen = false">
					<BaseInput v-model="email" type="email" label="Почта участника" placeholder="name@example.com" />
					<BaseButton type="submit">Отправить приглашение</BaseButton>
				</form>
			</BasePopover>
		`,
	}),
	play: async ({ canvas, userEvent }) => {
		const trigger = canvas.getByRole('button', { name: 'Пригласить' })
		await userEvent.click(trigger)
		const field = await screen.findByLabelText('Почта участника')

		await userEvent.click(field)
		await expect(field).toHaveFocus()
		await userEvent.keyboard('ivan@example.com')
		await expect(field).toHaveValue('ivan@example.com')

		await userEvent.click(
			within(screen.getByRole('form', { name: 'Приглашение' })).getByRole('button', { name: 'Отправить приглашение' }),
		)
		await waitFor(() => expect(screen.queryByLabelText('Почта участника')).not.toBeInTheDocument())
		await expect(trigger).toHaveFocus()
	},
}
