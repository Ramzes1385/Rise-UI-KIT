import { VISA_NUMBER } from '../../shared'
import { expect, waitFor } from 'storybook/test'
import type meta from '../../BaseCardInput.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseCardInput from '../../../ui/BaseCardInput.vue'
import { storySource, useStorySetup } from '@/stories/helpers'

const models = { card: 'modelValue' }

const template = `<div class="story-narrow"><BaseCardInput v-bind="args" v-model="card" /></div>`

const FLIPPED = 'base-card-input__preview--flipped'

export const WithPreview: StoryObj<typeof meta> = {
	args: { hasPreview: true },
	parameters: {
		docs: {
			description: {
				story: [
					'Карта-превью над полями (`hasPreview`): номер, имя, срок и марка появляются на лицевой стороне по мере ввода, фон — по марке.',
					'Пока фокус в поле кода, карта повёрнута оборотом; код на ней — точками. Превью скрыто от чтения с экрана: всё то же есть в полях.',
					'При `prefers-reduced-motion` карта поворачивается сразу, без анимации.',
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
	play: async ({ canvas, canvasElement, userEvent }) => {
		const preview = canvasElement.querySelector('.base-card-input__preview') as HTMLElement
		const faceNumber = preview.querySelector('.base-card-input__face-number') as HTMLElement
		const faceCode = preview.querySelector('.base-card-input__face-code') as HTMLElement
		await expect(preview).toHaveAttribute('aria-hidden', 'true')
		await expect(faceNumber).toHaveTextContent('•••• •••• •••• ••••')

		await userEvent.tab()
		await expect(canvas.getByLabelText('Номер карты')).toHaveFocus()
		await userEvent.keyboard(VISA_NUMBER)
		await expect(faceNumber).toHaveTextContent('4242 4242 4242 4242')
		await expect(preview.querySelector('.base-card-input__face-brand')).not.toBeNull()

		await waitFor(() => expect(canvas.getByLabelText('Срок действия')).toHaveFocus())
		await userEvent.keyboard('1234')
		await expect(preview.querySelector('.base-card-input__face-expiry')).toHaveTextContent('12/34')

		const code = canvas.getByLabelText('Код CVV2')
		await waitFor(() => expect(code).toHaveFocus())
		await expect(preview).toHaveClass(FLIPPED)
		await userEvent.keyboard('12')
		await expect(faceCode).toHaveTextContent('••')
		await userEvent.keyboard('3')

		const holder = canvas.getByLabelText('Имя владельца')
		await waitFor(() => expect(holder).toHaveFocus())
		await expect(preview).not.toHaveClass(FLIPPED)

		await userEvent.tab({ shift: true })
		await expect(code).toHaveFocus()
		await expect(preview).toHaveClass(FLIPPED)
		await userEvent.tab()
		await expect(holder).toHaveFocus()
		await expect(preview).not.toHaveClass(FLIPPED)
		await userEvent.keyboard('ivan ivanov')
		await expect(preview.querySelector('.base-card-input__face-holder')).toHaveTextContent('IVAN IVANOV')
	},
}
