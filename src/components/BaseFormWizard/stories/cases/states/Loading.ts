import { expect } from 'storybook/test'
import { storySource } from '@/stories/helpers'
import type meta from '../../BaseFormWizard.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import {
	REGISTRATION_IMPORTS,
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
	state: { step: 'confirm' },
	data: { steps: REGISTRATION_STEPS },
	setup: registrationSetup,
	imports: REGISTRATION_IMPORTS,
	vue: ['reactive', 'ref'],
}
const source = storySource(wizardSource(options))

export const Loading: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Сохранение (`isLoading`): «Готово» показывает загрузку и сообщает `aria-busy`, «Назад» и шаги степпера недоступны, повторная отправка',
					'не приходит. Приложение включает `isLoading` после события `finish` и выключает, когда ответ получен.',
				].join('\n'),
			},
			source: source,
		},
	},
	args: { isLoading: true },
	render: wizardRender(options),
	play: async ({ canvas, userEvent, args }) => {
		const finish = canvas.getByRole('button', { name: 'Готово' })
		await expect(finish).toHaveAttribute('aria-busy', 'true')
		await expect(canvas.getByRole('button', { name: 'Назад' })).toBeDisabled()
		await userEvent.click(finish)
		await expect(args.onFinish).not.toHaveBeenCalled()
	},
}
