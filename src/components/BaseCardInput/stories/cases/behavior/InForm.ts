import { reactive, ref } from 'vue'
import { VISA_NUMBER } from '../../shared'
import { BaseForm } from '@components/BaseForm'
import { expect, waitFor } from 'storybook/test'
import type meta from '../../BaseCardInput.stories'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import { staticStorySource } from '@/stories/helpers'
import BaseCardInput from '../../../ui/BaseCardInput.vue'
import { BaseFormField } from '@components/BaseFormField'
import type { CardInputValue } from '../../../types/BaseCardInput.types'
import type { StandardSchemaIssue, StandardSchemaV1 } from '@utils/form/formUtils'

interface Payment {
	card: CardInputValue | null
}

const PAYMENT_SCHEMA: StandardSchemaV1<Payment> = {
	'~standard': {
		version: 1,
		vendor: 'story',
		validate: value => {
			const data = value as Payment
			const issues: StandardSchemaIssue[] = []
			if (data.card?.isComplete !== true) issues.push({ message: 'Заполните данные карты', path: ['card'] })
			return issues.length ? { issues } : { value: data }
		},
	},
}

const template = `
	<div class="story-narrow">
		<BaseForm :schema="schema" :state="state" aria-label="Оплата заказа" @submit="handleSubmit">
			<div class="story-col">
				<BaseFormField label="Карта" name="card" description="Данные карты не сохраняются">
					<BaseCardInput v-model="state.card" :has-holder="false" />
				</BaseFormField>
				<BaseButton type="submit">Оплатить 990 ₽</BaseButton>
				<p v-if="paid" role="status" style="margin: 0; color: var(--rise-success);">{{ paid }}</p>
			</div>
		</BaseForm>
	</div>
`

const script = String.raw`
interface Payment {
	card: CardInputValue | null
}

const schema: StandardSchemaV1<Payment> = {
	'~standard': {
		version: 1,
		vendor: 'story',
		validate: value => {
			const data = value as Payment
			const issues: StandardSchemaIssue[] = []
			if (data.card?.isComplete !== true) issues.push({ message: 'Заполните данные карты', path: ['card'] })
			return issues.length ? { issues } : { value: data }
		},
	},
}

const state = reactive<Payment>({ card: null })
const paid = ref('')

function handleSubmit(): void {
	paid.value = ${'`'}Оплата картой •••• ${'$'}{state.card?.last4} принята${'`'}
}
`

export const InForm: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'В BaseFormField и BaseForm со схемой: группу называет подпись обёртки, описание и ошибка обёртки описывают `fieldset`.',
					'В `state` формы — сводка `v-model`, схема проверяет `isComplete`. Номер карты в состояние формы не попадает.',
				].join('\n'),
			},
			source: staticStorySource({
				template,
				imports: ['BaseForm', 'BaseFormField', 'BaseCardInput', 'BaseButton', 'type CardInputValue'],
				importsFrom: { '@ramzes1385/rise-ui-kit/utils': ['type StandardSchemaIssue', 'type StandardSchemaV1'] },
				vue: ['reactive', 'ref'],
				script,
			}),
		},
		controls: { disable: true },
	},
	render: () => ({
		components: { BaseForm, BaseFormField, BaseCardInput, BaseButton },
		setup: () => {
			const state = reactive<Payment>({ card: null })
			const paid = ref('')
			const handleSubmit = (): void => {
				paid.value = `Оплата картой •••• ${state.card?.last4} принята`
			}
			return { schema: PAYMENT_SCHEMA, state, paid, handleSubmit }
		},
		template,
	}),
	play: async ({ canvas, userEvent }) => {
		const group = canvas.getByRole('group', { name: 'Карта' })
		await expect(group).toHaveAccessibleDescription('Данные карты не сохраняются')
		await userEvent.click(canvas.getByRole('button', { name: 'Оплатить 990 ₽' }))
		await waitFor(() => expect(group).toHaveAttribute('aria-invalid', 'true'))
		await expect(group).toHaveAccessibleDescription('Заполните данные карты')

		await userEvent.click(canvas.getByLabelText('Номер карты'))
		await userEvent.keyboard(VISA_NUMBER)
		await userEvent.keyboard('1234')
		await userEvent.keyboard('123')
		await userEvent.click(canvas.getByRole('button', { name: 'Оплатить 990 ₽' }))
		await waitFor(() => expect(canvas.getByRole('status')).toHaveTextContent('Оплата картой •••• 4242 принята'))
		await expect(group).not.toHaveAttribute('aria-invalid', 'true')
	},
}
