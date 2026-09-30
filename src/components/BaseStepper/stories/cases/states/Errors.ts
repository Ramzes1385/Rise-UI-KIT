import { SLOT_KEYS } from '../../shared'
import type meta from '../../BaseStepper.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseStepper from '../../../ui/BaseStepper.vue'
import { expect, fn, waitFor, within } from 'storybook/test'
import type { BaseStepperStep } from '../../../types/BaseStepper.types'
import { literal, storySource, useStorySetup } from '@/stories/helpers'

const steps: BaseStepperStep[] = [
	{ label: 'Корзина', description: '3 товара' },
	{ label: 'Доставка', description: 'Курьер, 15 мая' },
	{ label: 'Оплата', description: 'Карта отклонена банком', isError: true },
	{ label: 'Отзыв', description: 'После получения', isOptional: true },
]

const models = { step: 'modelValue' }

const HIDDEN = [...SLOT_KEYS, 'items']

const template = `
	<BaseStepper v-bind="args" v-model="step" :items="steps" is-linear />
`

export const Errors: StoryObj<typeof meta> = {
	args: { modelValue: 3, variant: 'animated', onChange: fn() },
	parameters: {
		docs: {
			description: {
				story: [
					'Stepper — шаги процесса, по которым идут вперёд. Пройденные — с галочкой, текущий — кольцом, шаг с ошибкой',
					'(`isError`) — красным со знаком «!», необязательный (`isOptional`) — с подписью. `isLinear`: вперёд — только',
					'на следующий шаг, к пройденным можно вернуться. Экранный диктор слышит «Корзина, пройден», «Оплата, ошибка».',
				].join('\n'),
			},
			source: storySource({ template, imports: ['BaseStepper'], models, script: `const steps = ${literal(steps)}`, omit: HIDDEN }),
		},
	},
	render: args => ({
		components: { BaseStepper },
		setup: useStorySetup(args, { models, data: { steps }, slots: HIDDEN }),
		template,
	}),
	play: async ({ canvas, userEvent, args }) => {
		const payment = canvas.getByRole('button', { name: /^Оплата\s?, ошибка/ })
		await expect(payment).toHaveAttribute('aria-current', 'step')
		await expect(canvas.getByRole('button', { name: /^Корзина\s?, пройден/ })).toBeInTheDocument()
		await expect(within(canvas.getByRole('button', { name: /Отзыв/ })).getByText('Необязательно')).toBeVisible()

		await userEvent.click(canvas.getByRole('button', { name: /^Доставка\s?, пройден/ }))
		await waitFor(() => expect(canvas.getByRole('button', { name: /Доставка/ })).toHaveAttribute('aria-current', 'step'))
		await expect(canvas.getByRole('button', { name: /Отзыв/ })).toHaveAttribute('aria-disabled', 'true')
		await expect(args.onChange).toHaveBeenCalledWith(2)
	},
}
