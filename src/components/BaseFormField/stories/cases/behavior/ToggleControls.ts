import { expect } from 'storybook/test'
import { BaseRadio } from '@components/BaseRadio'
import type meta from '../../BaseFormField.stories'
import { BaseSwitch } from '@components/BaseSwitch'
import type { StoryObj } from '@storybook/vue3-vite'
import { BaseCheckbox } from '@components/BaseCheckbox'
import BaseFormField from '../../../ui/BaseFormField.vue'
import { literal, staticStorySource, useStorySetup } from '@/stories/helpers'

const payments = [
	{ value: 'card', label: 'Картой' },
	{ value: 'cash', label: 'Наличными' },
]

const state = { isGift: false, isNotified: true, payment: 'card' }

const template = `
	<div class="story-stack story-narrow">
		<BaseFormField label="Подарочная упаковка" description="Без ценника и чека">
			<BaseCheckbox v-model="isGift" />
		</BaseFormField>
		<BaseFormField label="Уведомления" error="Нужно хотя бы одно уведомление">
			<BaseSwitch v-model="isNotified" label="SMS о статусе заказа">Не чаще раза в день</BaseSwitch>
		</BaseFormField>
		<BaseFormField label="Оплата" description="Комиссии нет" is-required>
			<BaseRadio v-model="payment" name="payment" :options="payments" />
		</BaseFormField>
	</div>
`

export const ToggleControls: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Флажок, переключатель и радиогруппа внутри обёртки берут из неё описание или ошибку (`aria-describedby`),',
					'`aria-invalid`, `aria-required` и цвет ошибки. Без своей подписи флажок называется подписью обёртки,',
					'радиогруппа — тоже. Переключатель со своей подписью обёртку не занимает: она становится группой,',
					'а описание переключателя (слот `default`) и ошибка обёртки описывают его.',
				].join('\n'),
			},
			source: staticStorySource({
				template,
				imports: ['BaseFormField', 'BaseCheckbox', 'BaseSwitch', 'BaseRadio'],
				script: `const payments = ${literal(payments)}`,
				state,
			}),
		},
		controls: { disable: true },
	},
	render: args => ({
		components: { BaseFormField, BaseCheckbox, BaseSwitch, BaseRadio },
		setup: useStorySetup(args, { state, data: { payments } }),
		template,
	}),
	play: async ({ canvas, userEvent }) => {
		const gift = canvas.getByRole('checkbox', { name: 'Подарочная упаковка' })
		await expect(gift).toHaveAccessibleDescription('Без ценника и чека')
		await userEvent.click(canvas.getByText('Подарочная упаковка'))
		await expect(gift).toBeChecked()

		await expect(canvas.getByRole('group', { name: 'Уведомления' })).toBeInTheDocument()
		const sms = canvas.getByRole('switch', { name: 'SMS о статусе заказа' })
		await expect(sms).toHaveAttribute('aria-invalid', 'true')
		await expect(sms).toHaveAccessibleDescription('Не чаще раза в день Нужно хотя бы одно уведомление')
		sms.focus()
		await userEvent.keyboard(' ')
		await expect(sms).not.toBeChecked()

		const payment = canvas.getByRole('radiogroup', { name: 'Оплата' })
		await expect(payment).toHaveAccessibleDescription('Комиссии нет')
		await expect(payment).toHaveAttribute('aria-required', 'true')
		canvas.getByRole('radio', { name: 'Картой' }).focus()
		await userEvent.keyboard('{ArrowDown}')
		await expect(canvas.getByRole('radio', { name: 'Наличными' })).toBeChecked()
	},
}
