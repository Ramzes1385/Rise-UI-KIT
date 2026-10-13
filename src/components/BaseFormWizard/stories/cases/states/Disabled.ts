import { expect } from 'storybook/test'
import { storySource } from '@/stories/helpers'
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

export const Disabled: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: 'Отключённый мастер (`isDisabled`): поля шага, «Назад», «Далее» и шаги степпера недоступны, переходов нет.',
			},
			source: source,
		},
	},
	args: { isDisabled: true },
	render: wizardRender(options),
	play: async ({ canvas, args }) => {
		await expect(canvas.getByRole('textbox', { name: /Почта/ })).toBeDisabled()
		await expect(canvas.getByRole('button', { name: 'Назад' })).toBeDisabled()
		await expect(canvas.getByRole('button', { name: 'Далее' })).toBeDisabled()
		await expect(canvas.getByText('Аккаунт', { selector: '.base-stepper__label' })).toBeVisible()
		await expect(args['onStep-change']).not.toHaveBeenCalled()
	},
}
