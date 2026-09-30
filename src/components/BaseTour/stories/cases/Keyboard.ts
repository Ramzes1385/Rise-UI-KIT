import type meta from '../BaseTour.stories'
import BaseTour from '../../ui/BaseTour.vue'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import { screen, within, waitFor, expect } from 'storybook/test'
import { storySource, tabTo, useStorySetup } from '@/stories/helpers'

const OWN_ARGS = ['isOpen', 'step', 'onUpdate:isOpen', 'onUpdate:step']

const state = { isOpen: false, step: 0 }

const template = `
	<div class="story-stack">
		<div class="story-row">
			<BaseButton id="tour-create">Создать проект</BaseButton>
			<BaseButton id="tour-import" variant="outline">Импорт</BaseButton>
			<BaseButton id="tour-settings" variant="ghost">Настройки</BaseButton>
		</div>
		<div>
			<BaseButton variant="soft" @click="isOpen = true">Запустить тур</BaseButton>
		</div>
	</div>
	<BaseTour v-bind="args" v-model:is-open="isOpen" v-model:step="step" />
`

export const Keyboard: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Клавиатура: Enter на кнопке запускает тур, фокус переходит на «Далее»; Tab обходит кнопки карточки по кругу,',
					'Enter переходит к следующему шагу, Escape пропускает тур и возвращает фокус на кнопку запуска.',
				].join('\n'),
			},
			source: storySource({ template, imports: ['BaseTour', 'BaseButton'], state, omit: OWN_ARGS }),
		},
	},
	tags: ['!autodocs'],
	render: args => ({
		components: { BaseTour, BaseButton },
		setup: useStorySetup(args, { state, slots: OWN_ARGS }),
		template,
	}),
	play: async ({ canvas, userEvent }) => {
		const start = canvas.getByRole('button', { name: 'Запустить тур' })
		await tabTo(start, userEvent)
		await userEvent.keyboard('{Enter}')

		const dialog = await screen.findByRole('dialog', { name: 'Новый проект' })
		const next = await within(dialog).findByRole('button', { name: 'Далее' })
		await waitFor(() => expect(next).toHaveFocus())

		await userEvent.tab()
		await expect(within(dialog).getByRole('button', { name: 'Пропустить тур' })).toHaveFocus()
		await userEvent.tab()
		await expect(next).toHaveFocus()

		await userEvent.keyboard('{Enter}')
		await expect(await screen.findByRole('dialog', { name: 'Импорт' })).toBeInTheDocument()

		await userEvent.keyboard('{Escape}')
		await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
		await expect(start).toHaveFocus()
	},
}
