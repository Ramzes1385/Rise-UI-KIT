import { storySource } from '@/stories/helpers'
import { expect, waitFor } from 'storybook/test'
import type meta from '../BaseFormWizard.stories'
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
} from '../shared'

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

export const Default: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Песочница: регистрация в три шага — «Аккаунт» (почта проверяется схемой), «Профиль» (необязательный), «Подтверждение».',
					'«Далее» проверяет шаг: пока почта не введена, мастер остаётся на шаге, а фокус уходит на поле с ошибкой.',
					'После перехода фокус на заголовке нового шага, а экранный диктор слышит «Шаг N из M». Меняйте props в Controls.',
				].join('\n'),
			},
			source: source,
		},
	},
	render: wizardRender(options),
	play: async ({ canvas, userEvent, args }) => {
		await userEvent.click(canvas.getByRole('button', { name: 'Далее' }))
		const email = await canvas.findByRole('textbox', { name: /Почта/ })
		await expect(await canvas.findByText('Введите почту, например name@example.com')).toBeInTheDocument()
		await waitFor(() => expect(email).toHaveFocus())
		await expect(args.onInvalid).toHaveBeenCalledWith('account')

		await userEvent.keyboard('anna@example.com{Enter}')
		await waitFor(() => expect(canvas.getByRole('heading', { name: 'Профиль' })).toHaveFocus())
		await expect(args.onNext).toHaveBeenCalledWith('account')
		await expect(canvas.getByRole('status')).toHaveTextContent('Шаг 2 из 3: Профиль')

		await userEvent.click(canvas.getByRole('button', { name: 'Пропустить' }))
		await waitFor(() => expect(canvas.getByRole('heading', { name: 'Подтверждение' })).toHaveFocus())
		await userEvent.click(canvas.getByRole('button', { name: 'Готово' }))
		await expect(await canvas.findByText('Регистрация завершена: anna@example.com')).toBeInTheDocument()
		await expect(args.onFinish).toHaveBeenCalledTimes(1)
	},
}
