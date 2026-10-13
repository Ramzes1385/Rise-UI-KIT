import { storySource } from '@/stories/helpers'
import { expect, waitFor } from 'storybook/test'
import type meta from '../../BaseFormWizard.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import {
	REGISTRATION_IMPORTS,
	REGISTRATION_STATE,
	REGISTRATION_STATE_CODE,
	REGISTRATION_STEPS,
	REGISTRATION_STEPS_CODE,
	registrationSetup,
	registrationTemplate,
	SCHEMA_CODE,
	type WizardCaseOptions,
	wizardRender,
	wizardSource,
} from '../../shared'

const options: WizardCaseOptions = {
	template: registrationTemplate(),
	script: [SCHEMA_CODE, REGISTRATION_STEPS_CODE, REGISTRATION_STATE_CODE].join(''),
	state: REGISTRATION_STATE,
	data: { steps: REGISTRATION_STEPS },
	setup: registrationSetup,
	imports: REGISTRATION_IMPORTS,
	vue: ['reactive', 'ref'],
}
const source = storySource(wizardSource(options))

export const OptionalSteps: StoryObj<typeof meta> = {
	parameters: {
		controls: { include: ['variant', 'sizeScale', 'isLinear'] },
		docs: {
			description: {
				story: [
					'Необязательный шаг (`isOptional`): в степпере под названием подпись «Необязательно», рядом с «Далее» кнопка «Пропустить».',
					'Пропуск идёт без проверки и сообщает `skip`; на последнем шаге «Пропустить» нет — там «Готово».',
				].join('\n'),
			},
			source: source,
		},
	},
	render: wizardRender(options),
	play: async ({ canvas, userEvent, args }) => {
		await userEvent.type(await canvas.findByRole('textbox', { name: /Почта/ }), 'anna@example.com{Enter}')
		await waitFor(() => expect(canvas.getByRole('heading', { name: 'Профиль' })).toHaveFocus())
		await expect(canvas.getByText('Необязательно')).toBeVisible()

		await userEvent.click(canvas.getByRole('button', { name: 'Пропустить' }))
		await waitFor(() => expect(canvas.getByRole('heading', { name: 'Подтверждение' })).toHaveFocus())
		await expect(args.onSkip).toHaveBeenCalledWith('profile')
		await expect(canvas.getByText(/Имя: не указано/)).toBeVisible()
		await expect(canvas.queryByRole('button', { name: 'Пропустить' })).not.toBeInTheDocument()
	},
}
