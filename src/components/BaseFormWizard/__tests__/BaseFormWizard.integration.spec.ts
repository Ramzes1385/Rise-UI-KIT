import '@testing-library/jest-dom/vitest'
import { reactive, ref } from 'vue'
import { BaseInput } from '@components/BaseInput'
import { UI_FORM_WIZARD } from '@/locales/messages'
import userEvent from '@testing-library/user-event'
import BaseFormWizard from '../ui/BaseFormWizard.vue'
import { BaseFormField } from '@components/BaseFormField'
import type { StandardSchemaV1 } from '@utils/form/formUtils'
import { render, screen, waitFor } from '@testing-library/vue'
import type { BaseFormWizardExpose } from '../types/BaseFormWizard.types'

function schemaOf(field: string, message: string): StandardSchemaV1 {
	return {
		'~standard': {
			version: 1,
			vendor: 'test',
			validate: value => {
				const data = value as Record<string, string>
				return data[field] ? { value } : { issues: [{ message, path: [field] }] }
			},
		},
	}
}

const STEPS = [
	{ id: 'account', title: 'Аккаунт', schema: schemaOf('email', 'Введите почту') },
	{ id: 'profile', title: 'Профиль', schema: schemaOf('name', 'Введите имя') },
	{ id: 'done', title: 'Готово к отправке' },
]

function renderWizard(props: Record<string, unknown> = {}) {
	const state = reactive({ email: '', name: '' })
	const wizard = ref<BaseFormWizardExpose | null>(null)
	const handlers = { onFinish: vi.fn(), onInvalid: vi.fn(), onNext: vi.fn() }
	const utils = render({
		components: { BaseFormWizard, BaseFormField, BaseInput },
		setup: () => ({ steps: STEPS, state, wizard, props, ...handlers }),
		template: `
			<BaseFormWizard ref="wizard" v-bind="props" :steps="steps" :state="state" @finish="onFinish" @invalid="onInvalid" @next="onNext">
				<template #step-account>
					<BaseFormField label="Почта" name="email"><BaseInput v-model="state.email" /></BaseFormField>
				</template>
				<template #step-profile>
					<BaseFormField label="Имя" name="name"><BaseInput v-model="state.name" /></BaseFormField>
				</template>
				<template #step-done><p>Всё готово</p></template>
			</BaseFormWizard>
		`,
	})
	return { ...utils, state, wizard, ...handlers }
}

describe('BaseFormWizard integration', () => {
	it('схема шага: ошибка у поля, фокус на нём, переход заблокирован, событие invalid', async () => {
		const user = userEvent.setup()
		const { onInvalid, onNext } = renderWizard()

		await user.click(screen.getByRole('button', { name: UI_FORM_WIZARD.NEXT }))

		expect(await screen.findByText('Введите почту')).toBeInTheDocument()
		await waitFor(() => expect(screen.getByRole('textbox', { name: 'Почта' })).toHaveFocus())
		expect(onInvalid).toHaveBeenCalledWith('account')
		expect(onNext).not.toHaveBeenCalled()
		expect(screen.getByRole('heading', { name: 'Аккаунт' })).toBeInTheDocument()
	})

	it('после исправления поля «Далее» открывает следующий шаг, а на нём фокус на заголовке', async () => {
		const user = userEvent.setup()
		const { onNext } = renderWizard()

		await user.click(screen.getByRole('button', { name: UI_FORM_WIZARD.NEXT }))
		await screen.findByText('Введите почту')
		await user.type(screen.getByRole('textbox', { name: 'Почта' }), 'a@b.ru')
		await user.click(screen.getByRole('button', { name: UI_FORM_WIZARD.NEXT }))

		expect(await screen.findByRole('heading', { name: 'Профиль' })).toBeInTheDocument()
		expect(onNext).toHaveBeenCalledWith('account')
		await waitFor(() => expect(screen.getByRole('heading', { name: 'Профиль' })).toHaveFocus())
	})

	it('Enter в поле отправляет форму шага и идёт дальше', async () => {
		const user = userEvent.setup()
		renderWizard()

		await user.type(await screen.findByRole('textbox', { name: 'Почта' }), 'a@b.ru{Enter}')

		expect(await screen.findByRole('heading', { name: 'Профиль' })).toBeInTheDocument()
	})

	it('ошибка поля при отправке по Enter помечает шаг в степпере', async () => {
		const user = userEvent.setup()
		renderWizard()

		await user.type(await screen.findByRole('textbox', { name: 'Почта' }), '{Enter}')

		expect(await screen.findByText('Введите почту')).toBeInTheDocument()
		expect(screen.getByRole('button', { name: /Аккаунт, ошибка/ })).toBeInTheDocument()
	})

	it('полный проход: finish получает заполненный state', async () => {
		const user = userEvent.setup()
		const { onFinish, state } = renderWizard()

		await user.type(await screen.findByRole('textbox', { name: 'Почта' }), 'a@b.ru{Enter}')
		await user.type(await screen.findByRole('textbox', { name: 'Имя' }), 'Анна{Enter}')
		await screen.findByText('Всё готово')
		await user.click(screen.getByRole('button', { name: UI_FORM_WIZARD.FINISH }))

		await waitFor(() => expect(onFinish).toHaveBeenCalledWith(state))
		expect(state).toEqual({ email: 'a@b.ru', name: 'Анна' })
	})

	it('без isLinear «Готово» возвращает на шаг со схемой, где данные не заполнены, и показывает ошибку поля', async () => {
		const user = userEvent.setup()
		const { onFinish, onInvalid } = renderWizard({ isLinear: false, step: 'done' })

		await user.click(screen.getByRole('button', { name: UI_FORM_WIZARD.FINISH }))

		expect(await screen.findByText('Введите почту')).toBeInTheDocument()
		expect(onInvalid).toHaveBeenCalledWith('account')
		expect(onFinish).not.toHaveBeenCalled()
	})

	it('expose: next, back, goTo, validate', async () => {
		const { wizard, state } = renderWizard()

		expect(await wizard.value?.validate()).toBe(false)
		expect(await wizard.value?.next()).toBe(false)
		state.email = 'a@b.ru'
		expect(await wizard.value?.next()).toBe(true)
		await screen.findByRole('heading', { name: 'Профиль' })
		expect(wizard.value?.back()).toBe(true)
		expect(wizard.value?.back()).toBe(false)
		expect(await wizard.value?.goTo('done')).toBe(false)
		expect(await wizard.value?.goTo('profile')).toBe(true)
		expect(await wizard.value?.goTo('profile')).toBe(false)
		expect(await wizard.value?.goTo('нет')).toBe(false)
		await screen.findByRole('heading', { name: 'Профиль' })
		expect(await wizard.value?.goTo('account')).toBe(true)
	})

	it('expose: goTo вперёд без isLinear не проверяет шаги', async () => {
		const { wizard } = renderWizard({ isLinear: false })

		expect(await wizard.value?.goTo('done')).toBe(true)
		expect(await screen.findByText('Всё готово')).toBeInTheDocument()
	})

	it('expose без шагов: ничего не делает, проверка проходит', async () => {
		const wizard = ref<BaseFormWizardExpose | null>(null)
		render({ components: { BaseFormWizard }, setup: () => ({ wizard }), template: '<BaseFormWizard ref="wizard" />' })

		expect(await wizard.value?.next()).toBe(false)
		expect(wizard.value?.back()).toBe(false)
		expect(await wizard.value?.goTo('нет')).toBe(false)
		expect(await wizard.value?.validate()).toBe(true)
	})
})
