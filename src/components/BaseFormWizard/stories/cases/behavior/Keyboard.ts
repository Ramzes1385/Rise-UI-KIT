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

export const Keyboard: StoryObj<typeof meta> = {
	parameters: {
		controls: { include: ['variant', 'sizeScale', 'isLinear'] },
		docs: {
			description: {
				story: [
					'Клавиатура: Tab идёт по степперу (текущий шаг и следующий; дальние недоступны), затем по полям шага и кнопкам.',
					'Enter в поле отправляет форму шага — то же, что «Далее»: при ошибке фокус уходит на поле, при успехе — на заголовок нового шага.',
					'Shift+Tab возвращает по тому же порядку. Заголовок шага получает фокус программно (`tabindex="-1"`) и в порядок Tab не входит.',
				].join('\n'),
			},
			source: source,
		},
	},
	tags: ['!autodocs'],
	render: wizardRender(options),
	play: async ({ canvas, userEvent }) => {
		await userEvent.tab()
		await expect(canvas.getByRole('button', { name: /Аккаунт/ })).toHaveFocus()
		await userEvent.tab()
		await expect(canvas.getByRole('button', { name: /Профиль/ })).toHaveFocus()
		await userEvent.tab()
		const email = canvas.getByRole('textbox', { name: /Почта/ })
		await expect(email).toHaveFocus()
		await userEvent.tab()
		await expect(canvas.getByRole('button', { name: 'Далее' })).toHaveFocus()
		await userEvent.tab({ shift: true })
		await expect(email).toHaveFocus()

		await userEvent.keyboard('{Enter}')
		await expect(await canvas.findByText('Введите почту, например name@example.com')).toBeInTheDocument()
		await expect(email).toHaveFocus()

		await userEvent.keyboard('anna@example.com{Enter}')
		await waitFor(() => expect(canvas.getByRole('heading', { name: 'Профиль' })).toHaveFocus())
		await userEvent.tab()
		await expect(canvas.getByRole('textbox', { name: 'Имя' })).toHaveFocus()
		await userEvent.tab()
		await expect(canvas.getByRole('button', { name: 'Назад' })).toHaveFocus()
		await userEvent.keyboard('{Enter}')
		await waitFor(() => expect(canvas.getByRole('heading', { name: 'Аккаунт' })).toHaveFocus())
	},
}
