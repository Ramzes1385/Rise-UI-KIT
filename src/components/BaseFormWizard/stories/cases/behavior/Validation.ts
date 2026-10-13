import { reactive, ref } from 'vue'
import { storySource } from '@/stories/helpers'
import { expect, waitFor } from 'storybook/test'
import type meta from '../../BaseFormWizard.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import { EMAIL_SCHEMA, SCHEMA_CODE, type WizardCaseOptions, wizardRender, wizardSource } from '../../shared'

const template = `
	<div class="story-medium">
		<BaseFormWizard v-bind="args" v-model:step="step" :steps="steps" :state="state" @finish="handleFinish">
			<template #step-account>
				<BaseFormField label="Почта" name="email" is-required>
					<BaseInput v-model="state.email" type="email" placeholder="name@example.com" />
				</BaseFormField>
			</template>
			<template #step-promo>
				<BaseFormField label="Промокод" description="Для примера подходит RISE">
					<BaseInput v-model="state.promo" placeholder="Введите промокод" />
				</BaseFormField>
			</template>
			<template #step-confirm>
				<p>Промокод {{ state.promo }} принят.</p>
			</template>
		</BaseFormWizard>
		<p v-if="isSent" role="status">Заявка отправлена</p>
	</div>
`

const SCRIPT = `${SCHEMA_CODE}
const state = reactive({ email: '', promo: '' })
const isSent = ref(false)

const checkPromo = (code: string): Promise<boolean> => Promise.resolve(code.trim().toUpperCase() === 'RISE')

const steps = [
	{ id: 'account', title: 'Аккаунт', description: 'Проверяется схемой', schema: emailSchema },
	{
		id: 'promo',
		title: 'Промокод',
		description: 'Проверяется функцией validate',
		validate: async () => (await checkPromo(state.promo)) || 'Такого промокода нет',
	},
	{ id: 'confirm', title: 'Подтверждение' },
]

function handleFinish(): void {
	isSent.value = true
}
`

const options: WizardCaseOptions = {
	template,
	script: SCRIPT,
	state: { step: 'account' },
	imports: ['BaseFormField', 'BaseInput'],
	vue: ['reactive', 'ref'],
	setup: () => {
		const state = reactive({ email: '', promo: '' })
		const isSent = ref(false)
		const checkPromo = (code: string): Promise<boolean> => Promise.resolve(code.trim().toUpperCase() === 'RISE')
		const steps = [
			{ id: 'account', title: 'Аккаунт', description: 'Проверяется схемой', schema: EMAIL_SCHEMA },
			{
				id: 'promo',
				title: 'Промокод',
				description: 'Проверяется функцией validate',
				validate: async () => (await checkPromo(state.promo)) || 'Такого промокода нет',
			},
			{ id: 'confirm', title: 'Подтверждение' },
		]
		return {
			state,
			isSent,
			steps,
			handleFinish: (): void => {
				isSent.value = true
			},
		}
	},
}
const source = storySource(wizardSource(options))

export const Validation: StoryObj<typeof meta> = {
	parameters: {
		controls: { include: ['variant', 'sizeScale', 'isLinear'] },
		docs: {
			description: {
				story: [
					'Два вида проверки перед «Далее». `schema` шага (Standard Schema) проверяет `state`: ошибки показывают поля `BaseFormField` с тем же `name`,',
					'фокус — на первом поле с ошибкой. `validate` — функция, может быть асинхронной: `true` или ничего — шаг пройден, `false` — не пройден,',
					'строка — не пройден, строка показывается под полями (`role="alert"`). Пока проверка идёт, «Далее» показывает загрузку.',
				].join('\n'),
			},
			source: source,
		},
	},
	render: wizardRender(options),
	play: async ({ canvas, userEvent, args }) => {
		await userEvent.type(canvas.getByRole('textbox', { name: /Почта/ }), 'anna@example.com{Enter}')
		await waitFor(() => expect(canvas.getByRole('heading', { name: 'Промокод' })).toHaveFocus())

		const promo = canvas.getByRole('textbox', { name: 'Промокод' })
		await userEvent.type(promo, 'FAKE{Enter}')
		await expect(await canvas.findByRole('alert')).toHaveTextContent('Такого промокода нет')
		await expect(args.onInvalid).toHaveBeenCalledWith('promo')
		await expect(canvas.getByText(/ошибка/, { selector: '.base-stepper__status' })).toBeInTheDocument()

		await userEvent.clear(promo)
		await userEvent.type(promo, 'rise{Enter}')
		await waitFor(() => expect(canvas.getByRole('heading', { name: 'Подтверждение' })).toHaveFocus())
		await expect(canvas.queryByRole('alert')).not.toBeInTheDocument()
		await userEvent.click(canvas.getByRole('button', { name: 'Готово' }))
		await expect(await canvas.findByText('Заявка отправлена')).toBeInTheDocument()
	},
}
