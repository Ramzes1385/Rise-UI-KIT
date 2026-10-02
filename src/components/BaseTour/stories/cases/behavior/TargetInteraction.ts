import type meta from '../../BaseTour.stories'
import BaseTour from '../../../ui/BaseTour.vue'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import type { TourStep } from '../../../types/BaseTour.types'
import { screen, within, waitFor, expect } from 'storybook/test'
import { storySource, tabTo, useStorySetup } from '@/stories/helpers'

const OWN_ARGS = ['isOpen', 'step', 'onUpdate:isOpen', 'onUpdate:step']

const state = { isOpen: false, step: 0, likes: 0 }

const steps: TourStep[] = [
	{
		target: '#tour-like',
		title: 'Попробуйте сами',
		content: 'Нажмите на подсвеченную кнопку — тур не закроется. Tab из карточки тоже доходит до неё.',
	},
	{
		target: '#tour-like',
		title: 'Только посмотреть',
		content: 'На этом шаге кнопка закрыта затемнением: isTargetInteractive: false.',
		isTargetInteractive: false,
	},
]

const template = `
	<div class="story-stack">
		<div class="story-row">
			<BaseButton id="tour-like" variant="outline" @click="likes++">Нравится: {{ likes }}</BaseButton>
		</div>
		<div>
			<BaseButton variant="soft" @click="isOpen = true">Запустить тур</BaseButton>
		</div>
	</div>
	<BaseTour v-bind="args" v-model:is-open="isOpen" v-model:step="step" />
`

export const TargetInteraction: StoryObj<typeof meta> = {
	args: { steps },
	parameters: {
		docs: {
			description: {
				story: [
					'Подсвеченная цель доступна (`behavior.allowTargetInteraction`, по умолчанию `true`): по ней можно нажать, тур',
					'не закрывается; Tab из карточки доходит до цели и возвращается в карточку, окно тогда не модальное. На втором',
					'шаге `isTargetInteractive: false` — цель закрыта затемнением, Tab обходит только карточку.',
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

		const dialog = await screen.findByRole('dialog', { name: 'Попробуйте сами' })
		await expect(dialog).toHaveAttribute('aria-modal', 'false')
		const next = await within(dialog).findByRole('button', { name: 'Далее' })
		await waitFor(() => expect(next).toHaveFocus())

		await userEvent.tab()
		const like = canvas.getByRole('button', { name: 'Нравится: 0' })
		await expect(like).toHaveFocus()
		await userEvent.keyboard('{Enter}')
		await expect(await canvas.findByRole('button', { name: 'Нравится: 1' })).toBeInTheDocument()
		await expect(screen.getByRole('dialog')).toBeInTheDocument()

		await userEvent.tab()
		await expect(within(dialog).getByRole('button', { name: 'Пропустить тур' })).toHaveFocus()
		await userEvent.tab()
		await expect(next).toHaveFocus()
		await userEvent.keyboard('{Enter}')

		const second = await screen.findByRole('dialog', { name: 'Только посмотреть' })
		await expect(second).toHaveAttribute('aria-modal', 'true')
		await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('Шаг 2 из 2: Только посмотреть'))

		await userEvent.keyboard('{Escape}')
		await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
		await expect(start).toHaveFocus()
	},
}
