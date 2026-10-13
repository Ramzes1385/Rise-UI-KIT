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

export const WithError: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Шаг не прошёл проверку: «Далее» с пустой почтой показывает ошибку схемы у поля `BaseFormField` с `name="email"`, фокус уходит на поле,',
					'шаг в степпере помечен ошибкой («Аккаунт, ошибка»), приходит событие `invalid`; мастер остаётся на шаге.',
				].join('\n'),
			},
			source: source,
		},
	},
	render: wizardRender(options),
	play: async ({ canvas, userEvent, args }) => {
		await userEvent.click(canvas.getByRole('button', { name: 'Далее' }))
		const email = await canvas.findByRole('textbox', { name: /Почта/ })
		await waitFor(() => expect(email).toHaveFocus())
		await expect(email).toHaveAccessibleDescription(/Введите почту/)
		await expect(canvas.getByText(/ошибка/, { selector: '.base-stepper__status' })).toBeInTheDocument()
		await expect(args.onInvalid).toHaveBeenCalledWith('account')
		await expect(canvas.getByRole('heading', { name: 'Аккаунт' })).toBeInTheDocument()
	},
}
