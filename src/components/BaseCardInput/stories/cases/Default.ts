import { VISA_NUMBER } from '../shared'
import type meta from '../BaseCardInput.stories'
import { expect, waitFor } from 'storybook/test'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseCardInput from '../../ui/BaseCardInput.vue'
import { storySource, useStorySetup } from '@/stories/helpers'

const models = { card: 'modelValue' }

const template = `<div class="story-narrow"><BaseCardInput v-bind="args" v-model="card" /></div>`

export const Default: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Песочница: `v-model` — сводка о карте (марка, последние 4 цифры, срок, имя, `isComplete`), она видна в Controls.',
					'Номер и код в сводку не попадают. Тестовая карта Visa — 4242 4242 4242 4242.',
				].join('\n'),
			},
			source: storySource({ template, imports: ['BaseCardInput'], models }),
		},
	},
	render: args => ({
		components: { BaseCardInput },
		setup: useStorySetup(args, { models }),
		template,
	}),
	play: async ({ canvas, userEvent }) => {
		await expect(canvas.getByRole('group', { name: 'Оплата картой' })).toBeVisible()
		const number = canvas.getByLabelText('Номер карты')
		await userEvent.tab()
		await expect(number).toHaveFocus()
		await userEvent.keyboard(VISA_NUMBER)
		await expect(number).toHaveValue('4242 4242 4242 4242')
		await expect(canvas.getByRole('img', { name: 'Марка карты: Visa' })).toBeVisible()

		const expiry = canvas.getByLabelText('Срок действия')
		await waitFor(() => expect(expiry).toHaveFocus())
		await userEvent.keyboard('1234')
		await expect(expiry).toHaveValue('12/34')

		const code = canvas.getByLabelText('Код CVV2')
		await waitFor(() => expect(code).toHaveFocus())
		await userEvent.keyboard('123')

		const holder = canvas.getByLabelText('Имя владельца')
		await waitFor(() => expect(holder).toHaveFocus())
		await userEvent.keyboard('ivan  ivanov')
		await expect(holder).toHaveValue('IVAN IVANOV')
	},
}
