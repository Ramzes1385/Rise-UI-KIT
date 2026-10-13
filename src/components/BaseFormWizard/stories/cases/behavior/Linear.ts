import { storySource } from '@/stories/helpers'
import type meta from '../../BaseFormWizard.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import { expect, waitFor, within } from 'storybook/test'
import type { FormWizardStep } from '../../../types/BaseFormWizard.types'
import { type WizardCaseOptions, wizardRender, wizardSource } from '../../shared'

const STEPS: FormWizardStep[] = [
	{ id: 'account', title: 'Аккаунт', validate: () => 'Заполните шаг, чтобы перейти дальше' },
	{ id: 'profile', title: 'Профиль' },
	{ id: 'confirm', title: 'Подтверждение' },
]

const SCRIPT = String.raw`
const steps = [
	{ id: 'account', title: 'Аккаунт', validate: () => 'Заполните шаг, чтобы перейти дальше' },
	{ id: 'profile', title: 'Профиль' },
	{ id: 'confirm', title: 'Подтверждение' },
]
`

const template = `
	<div class="story-stack">
		<div>
			<span class="story-label">isLinear — вперёд только после проверки</span>
			<BaseFormWizard v-bind="args" :steps="steps">
				<template #default="{ step }">
					<p>Здесь поля шага «{{ step.title }}»</p>
				</template>
			</BaseFormWizard>
		</div>
		<div>
			<span class="story-label">без isLinear — шаги выбираются свободно</span>
			<BaseFormWizard v-bind="args" :is-linear="false" :steps="steps">
				<template #default="{ step }">
					<p>Здесь поля шага «{{ step.title }}»</p>
				</template>
			</BaseFormWizard>
		</div>
	</div>
`

const options: WizardCaseOptions = { template, script: SCRIPT, data: { steps: STEPS } }
const source = storySource(wizardSource(options))

export const Linear: StoryObj<typeof meta> = {
	parameters: {
		controls: { include: ['variant', 'sizeScale'] },
		docs: {
			description: {
				story: [
					'Линейный режим (`isLinear`, по умолчанию включён): вперёд — только на следующий шаг и только после проверки текущего, шаг через один в степпере недоступен,',
					'назад — всегда. Без него шаги в степпере выбираются свободно, проверка нужна только кнопке «Готово»: она проверяет все шаги по порядку',
					'и возвращает на первый непройденный. У первого шага здесь проверка, которая не пропускает дальше.',
				].join('\n'),
			},
			source: source,
		},
	},
	render: wizardRender(options),
	play: async ({ canvasElement, userEvent }) => {
		const [linearRoot, freeRoot] = [...canvasElement.querySelectorAll<HTMLElement>('.base-form-wizard')]
		const linear = within(linearRoot)
		const free = within(freeRoot)

		await expect(linear.getByRole('button', { name: /Подтверждение/ })).toBeDisabled()
		await userEvent.click(linear.getByRole('button', { name: /Профиль/ }))
		await expect(await linear.findByRole('alert')).toHaveTextContent('Заполните шаг, чтобы перейти дальше')
		await expect(linear.getByRole('heading', { name: 'Аккаунт' })).toBeInTheDocument()

		await userEvent.click(free.getByRole('button', { name: /Подтверждение/ }))
		await waitFor(() => expect(free.getByRole('heading', { name: 'Подтверждение' })).toHaveFocus())
		await userEvent.click(free.getByRole('button', { name: 'Назад' }))
		await waitFor(() => expect(free.getByRole('heading', { name: 'Профиль' })).toHaveFocus())
	},
}
