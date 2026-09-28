import { ref } from 'vue'
import { SHOWCASE_OWN_ARGS } from '../shared'
import type meta from '../BaseSlideover.stories'
import { BaseInput } from '@components/BaseInput'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseSlideover from '../../ui/BaseSlideover.vue'
import { useArgsWithoutSlots, tabTo } from '@/stories/helpers'
import { screen, within, waitFor, expect } from 'storybook/test'

export const Keyboard: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Клавиатура: Enter на кнопке открывает панель и переводит фокус внутрь, Tab и Shift+Tab обходят элементы панели',
					'по кругу, Escape закрывает её и возвращает фокус на кнопку.',
				].join('\n'),
			},
		},
	},
	tags: ['!autodocs'],
	render: args => ({
		components: { BaseSlideover, BaseButton, BaseInput },
		setup: () => ({ props: useArgsWithoutSlots(args, [...SHOWCASE_OWN_ARGS]), isOpen: ref(false), query: ref('') }),
		template: `
			<BaseButton variant="outline" @click="isOpen = true">Поиск по проектам</BaseButton>
			<BaseSlideover v-bind="props" v-model:is-open="isOpen" title="Поиск">
				<BaseInput v-model="query" label="Запрос" />
				<template #footer>
					<BaseButton @click="isOpen = false">Найти</BaseButton>
				</template>
			</BaseSlideover>
		`,
	}),
	play: async ({ canvas, userEvent }) => {
		const trigger = canvas.getByRole('button', { name: 'Поиск по проектам' })
		await tabTo(trigger, userEvent)
		await userEvent.keyboard('{Enter}')

		const dialog = await screen.findByRole('dialog', { name: 'Поиск' })
		const close = within(dialog).getByRole('button', { name: 'Закрыть' })
		await waitFor(() => expect(close).toHaveFocus())

		await userEvent.tab()
		await expect(within(dialog).getByLabelText('Запрос')).toHaveFocus()
		await userEvent.tab()
		await expect(within(dialog).getByRole('button', { name: 'Найти' })).toHaveFocus()
		await userEvent.tab()
		await expect(close).toHaveFocus()
		await userEvent.tab({ shift: true })
		await expect(within(dialog).getByRole('button', { name: 'Найти' })).toHaveFocus()

		await userEvent.keyboard('{Escape}')
		await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
		await expect(trigger).toHaveFocus()
	},
}
