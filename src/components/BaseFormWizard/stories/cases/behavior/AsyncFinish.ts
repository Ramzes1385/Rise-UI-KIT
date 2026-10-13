import { reactive, ref } from 'vue'
import { storySource } from '@/stories/helpers'
import { expect, waitFor } from 'storybook/test'
import type meta from '../../BaseFormWizard.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import {
	REGISTRATION_IMPORTS,
	REGISTRATION_STEPS,
	REGISTRATION_STEPS_CODE,
	registrationTemplate,
	SCHEMA_CODE,
	type WizardCaseOptions,
	wizardRender,
	wizardSource,
} from '../../shared'

const SCRIPT = `${SCHEMA_CODE}${REGISTRATION_STEPS_CODE}
const state = reactive({ email: 'anna@example.com', name: 'Анна' })
const finished = ref('')
const isSaving = ref(false)

function handleFinish(data?: Record<string, unknown>): void {
	isSaving.value = true
	setTimeout(() => {
		isSaving.value = false
		finished.value = String(data?.email)
	}, 600)
}
`

const options: WizardCaseOptions = {
	template: registrationTemplate(':is-loading="isSaving"'),
	script: SCRIPT,
	state: { step: 'confirm' },
	data: { steps: REGISTRATION_STEPS },
	imports: REGISTRATION_IMPORTS,
	vue: ['reactive', 'ref'],
	setup: () => {
		const state = reactive({ email: 'anna@example.com', name: 'Анна' })
		const finished = ref('')
		const isSaving = ref(false)
		const handleFinish = (data?: Record<string, unknown>): void => {
			isSaving.value = true
			setTimeout(() => {
				isSaving.value = false
				finished.value = String(data?.email)
			}, 600)
		}
		return { state, finished, isSaving, handleFinish }
	},
}
const source = storySource(wizardSource(options))

export const AsyncFinish: StoryObj<typeof meta> = {
	parameters: {
		controls: { include: ['variant', 'sizeScale'] },
		docs: {
			description: {
				story: [
					'Асинхронное завершение: после `finish` приложение сохраняет данные и держит `isLoading`. Пока идёт сохранение, «Готово» в загрузке',
					'(`aria-busy`), «Назад» и степпер недоступны, форма заблокирована — повторной отправки нет. Ответ пришёл — `isLoading` выключается.',
				].join('\n'),
			},
			source: source,
		},
	},
	render: wizardRender(options),
	play: async ({ canvas, userEvent, args }) => {
		const finish = canvas.getByRole('button', { name: 'Готово' })
		await userEvent.click(finish)
		await waitFor(() => expect(finish).toHaveAttribute('aria-busy', 'true'))
		await expect(canvas.getByRole('button', { name: 'Назад' })).toBeDisabled()
		await userEvent.click(finish)
		await expect(args.onFinish).toHaveBeenCalledTimes(1)

		await expect(await canvas.findByText('Регистрация завершена: anna@example.com', {}, { timeout: 3000 })).toBeInTheDocument()
		await expect(finish).not.toHaveAttribute('aria-busy')
	},
}
