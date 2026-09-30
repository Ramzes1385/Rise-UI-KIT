import { SHOWCASE_OWN_ARGS } from '../../shared'
import { BaseInput } from '@components/BaseInput'
import type meta from '../../BaseSlideover.stories'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseSlideover from '../../../ui/BaseSlideover.vue'
import { screen, within, waitFor, expect } from 'storybook/test'
import { storySource, tabTo, useStorySetup } from '@/stories/helpers'

const state = { isOpen: false, query: '' }

const template = `
	<BaseButton variant="outline" @click="isOpen = true">Поиск по проектам</BaseButton>
	<BaseSlideover v-bind="args" v-model:is-open="isOpen" title="Поиск">
		<BaseInput v-model="query" label="Запрос" />
		<template #footer>
			<BaseButton @click="isOpen = false">Найти</BaseButton>
		</template>
	</BaseSlideover>
`

export const Keyboard: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Клавиатура: Enter на кнопке открывает панель и переводит фокус внутрь, Tab и Shift+Tab обходят элементы панели',
					'по кругу, Escape закрывает её и возвращает фокус на кнопку.',
				].join('\n'),
			},
			source: storySource({ template, imports: ['BaseSlideover', 'BaseButton', 'BaseInput'], state, omit: [...SHOWCASE_OWN_ARGS] }),
		},
	},
	tags: ['!autodocs'],
	render: args => ({
		components: { BaseSlideover, BaseButton, BaseInput },
		setup: useStorySetup(args, { state, slots: [...SHOWCASE_OWN_ARGS] }),
		template,
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
