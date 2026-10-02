import { expect, waitFor } from 'storybook/test'
import type meta from '../../BaseCardInput.stories'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseCardInput from '../../../ui/BaseCardInput.vue'
import { storySource, useStorySetup } from '@/stories/helpers'

const state = { card: null }
const types = { card: 'BaseCardInputExpose | null' }

const template = `
	<div class="story-narrow story-col">
		<BaseCardInput ref="card" v-bind="args" />
		<BaseButton @click="card?.validate()">Оплатить</BaseButton>
	</div>
`

export const Errors: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Ошибки полей появляются после ухода из поля: неверный номер или Луна, истёкший срок, неполный код, имя не латиницей.',
					'Пустые поля подсвечиваются только после `validate()` — здесь его вызывает кнопка «Оплатить», он же вернёт `isComplete`.',
				].join('\n'),
			},
			source: storySource({
				template,
				imports: ['BaseCardInput', 'BaseButton', 'type BaseCardInputExpose'],
				vue: ['ref'],
				state,
				types,
			}),
		},
	},
	render: args => ({
		components: { BaseCardInput, BaseButton },
		setup: useStorySetup(args, { state }),
		template,
	}),
	play: async ({ canvas, userEvent }) => {
		const number = canvas.getByLabelText('Номер карты')
		await userEvent.click(number)
		await userEvent.keyboard('4242424242424241')
		await expect(canvas.queryByText('Проверьте номер карты')).toBeNull()
		await userEvent.tab()
		await waitFor(() => expect(number).toHaveAccessibleDescription('Проверьте номер карты'))

		const expiry = canvas.getByLabelText('Срок действия')
		await expect(expiry).toHaveFocus()
		await userEvent.keyboard('0120')
		await waitFor(() => expect(expiry).toHaveAccessibleDescription('Срок действия карты истёк'))

		const holder = canvas.getByLabelText('Имя владельца')
		await userEvent.click(holder)
		await userEvent.keyboard('Иван')
		await userEvent.tab()
		await waitFor(() => expect(holder).toHaveAccessibleDescription('Имя латиницей, как на карте'))

		const code = canvas.getByLabelText('Код CVV2')
		await expect(code).not.toHaveAccessibleDescription('Обязательное поле')
		await userEvent.click(canvas.getByRole('button', { name: 'Оплатить' }))
		await waitFor(() => expect(code).toHaveAccessibleDescription('Обязательное поле'))
	},
}
