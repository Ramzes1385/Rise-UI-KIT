import '@testing-library/jest-dom/vitest'
import { setLocale } from '@/locales/state'
import { createUiKitPlugin } from '@/plugin'
import userEvent from '@testing-library/user-event'
import BaseFormWizard from '../ui/BaseFormWizard.vue'
import { UI_FORM_WIZARD, UI_STEPPER } from '@/locales/messages'
import type { FormWizardStep } from '../types/BaseFormWizard.types'
import { fireEvent, render, screen, waitFor } from '@testing-library/vue'

const STEPS: FormWizardStep[] = [
	{ id: 'account', title: 'Аккаунт', description: 'Данные для входа' },
	{ id: 'profile', title: 'Профиль', isOptional: true },
	{ id: 'confirm', title: 'Подтверждение' },
]

const AB: FormWizardStep[] = [
	{ id: 'a', title: 'A' },
	{ id: 'b', title: 'B' },
]

const ABC: FormWizardStep[] = [...AB, { id: 'c', title: 'C' }]

const slots = {
	'step-account': '<p>Поля аккаунта</p>',
	default: '<p>Общий шаг {{ params.step.id }}</p>',
}

const stepButton = (name: string) => screen.getByRole('button', { name: new RegExp(name) })
const next = () => screen.getByRole('button', { name: UI_FORM_WIZARD.NEXT })
const finishButton = () => screen.getByRole('button', { name: UI_FORM_WIZARD.FINISH })

describe('BaseFormWizard unit', () => {
	beforeEach(() => setLocale('ru'))

	afterEach(() => setLocale('ru'))

	describe('рендер', () => {
		it('показывает степпер, заголовок и описание первого шага', () => {
			const { container } = render(BaseFormWizard, { props: { steps: STEPS }, slots })

			expect(container.querySelector('.base-form-wizard')).toBeInTheDocument()
			expect(container.querySelectorAll('.base-stepper__step')).toHaveLength(3)
			expect(screen.getByRole('heading', { level: 2, name: 'Аккаунт' })).toBeInTheDocument()
			expect(screen.getByText('Данные для входа')).toBeInTheDocument()
		})

		it('область шага — группа с именем заголовка и описанием', () => {
			render(BaseFormWizard, { props: { steps: STEPS }, slots })

			expect(screen.getByRole('group', { name: 'Аккаунт' })).toHaveAccessibleDescription('Данные для входа')
		})

		it('без описания у шага нет aria-describedby', () => {
			render(BaseFormWizard, { props: { steps: STEPS, step: 'profile' }, slots })

			expect(screen.getByRole('group', { name: 'Профиль' })).not.toHaveAttribute('aria-describedby')
		})

		it('слот шага по id заменяет общий слот', () => {
			render(BaseFormWizard, { props: { steps: STEPS }, slots })

			expect(screen.getByText('Поля аккаунта')).toBeInTheDocument()
			expect(screen.queryByText(/Общий шаг/)).not.toBeInTheDocument()
		})

		it('общий слот получает данные шага', () => {
			render(BaseFormWizard, { props: { steps: STEPS, step: 'confirm' }, slots })

			expect(screen.getByText('Общий шаг confirm')).toBeInTheDocument()
		})

		it('titleTag меняет тег заголовка', () => {
			render(BaseFormWizard, { props: { steps: STEPS, titleTag: 'h4' }, slots })

			expect(screen.getByRole('heading', { level: 4, name: 'Аккаунт' })).toHaveAttribute('tabindex', '-1')
		})

		it('без шагов — пустое состояние, кнопок нет', () => {
			render(BaseFormWizard)

			expect(screen.getByText(UI_FORM_WIZARD.EMPTY_TITLE)).toBeInTheDocument()
			expect(screen.queryByRole('button')).not.toBeInTheDocument()
		})

		it('если шаги исчезли — пустое состояние', async () => {
			const { rerender } = render(BaseFormWizard, { props: { steps: STEPS, step: 'confirm' }, slots })

			await rerender({ steps: [] })

			await waitFor(() => expect(screen.getByText(UI_FORM_WIZARD.EMPTY_TITLE)).toBeInTheDocument())
		})

		it('необязательный шаг подписан в степпере', () => {
			render(BaseFormWizard, { props: { steps: STEPS }, slots })

			expect(screen.getByText(UI_STEPPER.OPTIONAL)).toBeInTheDocument()
		})

		it('в английской локали кнопки из английского словаря', () => {
			setLocale('en')
			render(BaseFormWizard, { props: { steps: STEPS }, slots })

			expect(screen.getByRole('button', { name: 'Back' })).toBeInTheDocument()
			expect(screen.getByRole('button', { name: 'Next' })).toBeInTheDocument()
			expect(screen.getByRole('group', { name: 'Step navigation' })).toBeInTheDocument()
		})
	})

	describe('кнопки', () => {
		it('на первом шаге «Назад» отключена, «Пропустить» нет', () => {
			render(BaseFormWizard, { props: { steps: STEPS }, slots })

			expect(screen.getByRole('button', { name: UI_FORM_WIZARD.BACK })).toBeDisabled()
			expect(screen.queryByRole('button', { name: UI_FORM_WIZARD.SKIP })).not.toBeInTheDocument()
		})

		it('на необязательном шаге есть «Пропустить»', () => {
			render(BaseFormWizard, { props: { steps: STEPS, step: 'profile' }, slots })

			expect(screen.getByRole('button', { name: UI_FORM_WIZARD.SKIP })).toBeEnabled()
		})

		it('на последнем шаге вместо «Далее» — «Готово», «Пропустить» нет даже у необязательного', () => {
			render(BaseFormWizard, { props: { steps: [AB[0], { ...AB[1], isOptional: true }], step: 'b' } })

			expect(finishButton()).toBeInTheDocument()
			expect(screen.queryByRole('button', { name: UI_FORM_WIZARD.SKIP })).not.toBeInTheDocument()
			expect(screen.queryByRole('button', { name: UI_FORM_WIZARD.NEXT })).not.toBeInTheDocument()
		})

		it('«Далее» — кнопка отправки формы шага', () => {
			render(BaseFormWizard, { props: { steps: STEPS }, slots })
			const form = document.querySelector('form') as HTMLFormElement

			expect(next()).toHaveAttribute('type', 'submit')
			expect(next()).toHaveAttribute('form', form.id)
		})
	})

	describe('переходы', () => {
		it('«Далее» открывает следующий шаг и сообщает next, step-change, update:step', async () => {
			const user = userEvent.setup()
			const { emitted } = render(BaseFormWizard, { props: { steps: STEPS }, slots })

			await user.click(next())

			expect(await screen.findByRole('heading', { name: 'Профиль' })).toBeInTheDocument()
			expect(emitted().next).toEqual([['account']])
			expect(emitted()['step-change']).toEqual([[{ to: 'profile', from: 'account' }]])
			expect(emitted()['update:step']).toEqual([['profile']])
		})

		it('«Назад» возвращает на предыдущий шаг без проверки и сообщает back', async () => {
			const user = userEvent.setup()
			const validate = vi.fn(() => false)
			const { emitted } = render(BaseFormWizard, { props: { steps: [{ ...AB[0], validate }, AB[1]], step: 'b' } })

			await user.click(screen.getByRole('button', { name: UI_FORM_WIZARD.BACK }))

			expect(await screen.findByRole('heading', { name: 'A' })).toBeInTheDocument()
			expect(emitted().back).toEqual([['b']])
			expect(validate).not.toHaveBeenCalled()
		})

		it('«Пропустить» переходит дальше без проверки и сообщает skip', async () => {
			const user = userEvent.setup()
			const validate = vi.fn(() => false)
			const { emitted } = render(BaseFormWizard, { props: { steps: [{ ...AB[0], isOptional: true, validate }, AB[1]] } })

			await user.click(screen.getByRole('button', { name: UI_FORM_WIZARD.SKIP }))

			expect(await screen.findByRole('heading', { name: 'B' })).toBeInTheDocument()
			expect(emitted().skip).toEqual([['a']])
			expect(emitted().next).toBeUndefined()
			expect(validate).not.toHaveBeenCalled()
		})

		it('пропуск сбрасывает пометку ошибки у шага', async () => {
			const user = userEvent.setup()
			render(BaseFormWizard, { props: { steps: [{ ...AB[0], isOptional: true, validate: () => 'Нет' }, AB[1]] } })

			await user.click(next())
			expect(await screen.findByRole('alert')).toHaveTextContent('Нет')
			await user.click(screen.getByRole('button', { name: UI_FORM_WIZARD.SKIP }))

			expect(await screen.findByRole('heading', { name: 'B' })).toBeInTheDocument()
			expect(screen.queryByText(new RegExp(UI_STEPPER.ERROR))).not.toBeInTheDocument()
		})

		it('смена пропа step переключает шаг', async () => {
			const { rerender } = render(BaseFormWizard, { props: { steps: STEPS, step: 'account' }, slots })

			await rerender({ step: 'confirm' })

			expect(screen.getByRole('heading', { name: 'Подтверждение' })).toBeInTheDocument()
		})

		it('неизвестный step — первый шаг; сброс step в undefined шаг не меняет', async () => {
			const { rerender } = render(BaseFormWizard, { props: { steps: STEPS, step: 'нет-такого' }, slots })

			expect(screen.getByRole('heading', { name: 'Аккаунт' })).toBeInTheDocument()
			await rerender({ step: undefined })
			expect(screen.getByRole('heading', { name: 'Аккаунт' })).toBeInTheDocument()
		})

		it('если текущего шага больше нет в steps — открывается первый', async () => {
			const { rerender } = render(BaseFormWizard, { props: { steps: STEPS, step: 'confirm' }, slots })

			await rerender({ steps: [STEPS[0], STEPS[1]] })

			await waitFor(() => expect(screen.getByRole('heading', { name: 'Аккаунт' })).toBeInTheDocument())
		})
	})

	describe('фокус и объявление', () => {
		it('после смены шага фокус на заголовке, объявление «Шаг N из M»', async () => {
			const user = userEvent.setup()
			render(BaseFormWizard, { props: { steps: STEPS }, slots })
			const status = screen.getByRole('status')

			expect(status).toBeEmptyDOMElement()
			await user.click(next())

			await waitFor(() => expect(screen.getByRole('heading', { name: 'Профиль' })).toHaveFocus())
			expect(status).toHaveTextContent('Шаг 2 из 3: Профиль')
		})

		it('на английском объявление английское', async () => {
			setLocale('en')
			const user = userEvent.setup()
			render(BaseFormWizard, { props: { steps: STEPS }, slots })

			await user.click(screen.getByRole('button', { name: 'Next' }))

			await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('Step 2 of 3: Профиль'))
		})
	})

	describe('проверка шага', () => {
		it('validate = false: остаёмся на шаге, показано общее сообщение, событие invalid', async () => {
			const user = userEvent.setup()
			const { emitted } = render(BaseFormWizard, { props: { steps: [{ ...AB[0], validate: () => false }, AB[1]] } })

			await user.click(next())

			expect(await screen.findByRole('alert')).toHaveTextContent(UI_FORM_WIZARD.STEP_INVALID)
			expect(screen.getByRole('heading', { name: 'A' })).toBeInTheDocument()
			expect(emitted().invalid).toEqual([['a']])
			expect(emitted().next).toBeUndefined()
		})

		it('validate = строка: строка — сообщение шага, шаг помечен ошибкой в степпере', async () => {
			const user = userEvent.setup()
			render(BaseFormWizard, { props: { steps: [{ ...AB[0], validate: () => 'Заполните поля' }, AB[1]] } })

			await user.click(next())

			expect(await screen.findByRole('alert')).toHaveTextContent('Заполните поля')
			expect(screen.getByRole('button', { name: new RegExp(`A, ${UI_STEPPER.ERROR}`) })).toBeInTheDocument()
		})

		it('асинхронный validate: кнопка в загрузке до результата, потом переход', async () => {
			const user = userEvent.setup()
			let resolveCheck = (): void => undefined
			const validate = () =>
				new Promise<boolean>(resolve => {
					resolveCheck = () => resolve(true)
				})
			render(BaseFormWizard, { props: { steps: [{ ...AB[0], validate }, AB[1]] } })

			await user.click(next())
			await waitFor(() => expect(next()).toHaveAttribute('aria-busy', 'true'))
			await user.click(next())
			resolveCheck()

			expect(await screen.findByRole('heading', { name: 'B' })).toBeInTheDocument()
		})

		it('успешная повторная проверка снимает сообщение и пометку', async () => {
			const user = userEvent.setup()
			let isOk = false
			render(BaseFormWizard, { props: { steps: [{ ...AB[0], validate: () => (isOk ? true : 'Ошибка') }, AB[1]] } })

			await user.click(next())
			expect(await screen.findByRole('alert')).toBeInTheDocument()
			isOk = true
			await user.click(next())

			expect(await screen.findByRole('heading', { name: 'B' })).toBeInTheDocument()
			expect(screen.queryByRole('alert')).not.toBeInTheDocument()
		})

		it('сообщение исчезает при смене шага', async () => {
			const user = userEvent.setup()
			render(BaseFormWizard, { props: { steps: [AB[0], { ...AB[1], validate: () => 'Нет' }, ABC[2]] } })

			await user.click(next())
			await screen.findByRole('heading', { name: 'B' })
			await user.click(next())
			expect(await screen.findByRole('alert')).toBeInTheDocument()
			await user.click(screen.getByRole('button', { name: UI_FORM_WIZARD.BACK }))

			await waitFor(() => expect(screen.queryByRole('alert')).not.toBeInTheDocument())
		})
	})

	describe('завершение', () => {
		it('«Готово» на последнем шаге сообщает finish с данными state', async () => {
			const user = userEvent.setup()
			const state = { name: 'Анна' }
			const { emitted } = render(BaseFormWizard, { props: { steps: STEPS, step: 'confirm', state }, slots })

			await user.click(finishButton())

			await waitFor(() => expect(emitted().finish).toEqual([[state]]))
		})

		it('в линейном режиме «Готово» проверяет только текущий шаг', async () => {
			const user = userEvent.setup()
			const first = vi.fn(() => false)
			const { emitted } = render(BaseFormWizard, { props: { steps: [{ ...AB[0], validate: first }, AB[1]], step: 'b' } })

			await user.click(finishButton())

			await waitFor(() => expect(emitted().finish).toHaveLength(1))
			expect(first).not.toHaveBeenCalled()
		})

		it('без isLinear «Готово» проверяет все шаги и переходит на первый непройденный', async () => {
			const user = userEvent.setup()
			const steps = [AB[0], { ...AB[1], validate: () => 'Нужно заполнить B' }, ABC[2]]
			const { emitted } = render(BaseFormWizard, { props: { steps, step: 'c', isLinear: false } })

			await user.click(finishButton())

			expect(await screen.findByRole('heading', { name: 'B' })).toBeInTheDocument()
			expect(await screen.findByRole('alert')).toHaveTextContent('Нужно заполнить B')
			expect(emitted().invalid).toEqual([['b']])
			expect(emitted().finish).toBeUndefined()
			expect(emitted()['step-change']).toEqual([[{ to: 'b', from: 'c' }]])
		})

		it('без isLinear непройденный текущий шаг не переключает мастер', async () => {
			const user = userEvent.setup()
			const steps = [AB[0], { ...AB[1], validate: () => false }]
			const { emitted } = render(BaseFormWizard, { props: { steps, step: 'b', isLinear: false } })

			await user.click(finishButton())

			expect(await screen.findByRole('alert')).toBeInTheDocument()
			expect(emitted()['step-change']).toBeUndefined()
			expect(emitted().invalid).toEqual([['b']])
		})

		it('без isLinear все шаги пройдены — finish', async () => {
			const user = userEvent.setup()
			const { emitted } = render(BaseFormWizard, { props: { steps: STEPS, step: 'confirm', isLinear: false }, slots })

			await user.click(finishButton())

			await waitFor(() => expect(emitted().finish).toHaveLength(1))
		})
	})

	describe('степпер', () => {
		it('в линейном режиме дальний шаг недоступен, следующий проходит проверку', async () => {
			const user = userEvent.setup()
			const { emitted } = render(BaseFormWizard, { props: { steps: [{ ...AB[0], validate: () => 'Нет' }, AB[1], ABC[2]] } })

			expect(stepButton('C')).toBeDisabled()
			await user.click(stepButton('B'))

			expect(await screen.findByRole('alert')).toHaveTextContent('Нет')
			expect(emitted()['step-change']).toBeUndefined()
		})

		it('в линейном режиме следующий шаг в степпере открывается после успешной проверки', async () => {
			const user = userEvent.setup()
			render(BaseFormWizard, { props: { steps: STEPS }, slots })

			await user.click(stepButton('Профиль'))

			expect(await screen.findByRole('heading', { name: 'Профиль' })).toBeInTheDocument()
		})

		it('назад по степперу — без проверки, событие back', async () => {
			const user = userEvent.setup()
			const { emitted } = render(BaseFormWizard, { props: { steps: STEPS, step: 'confirm' }, slots })

			await user.click(stepButton('Аккаунт'))

			expect(await screen.findByRole('heading', { name: 'Аккаунт' })).toBeInTheDocument()
			expect(emitted().back).toEqual([['confirm']])
		})

		it('без isLinear в степпере можно перескочить без проверки', async () => {
			const user = userEvent.setup()
			const validate = vi.fn(() => false)
			const { emitted } = render(BaseFormWizard, { props: { steps: [{ ...AB[0], validate }, AB[1], ABC[2]], isLinear: false } })

			await user.click(stepButton('C'))

			expect(await screen.findByRole('heading', { name: 'C' })).toBeInTheDocument()
			expect(validate).not.toHaveBeenCalled()
			expect(emitted().next).toBeUndefined()
		})

		it('клик по текущему шагу ничего не меняет', async () => {
			const user = userEvent.setup()
			const { emitted } = render(BaseFormWizard, { props: { steps: STEPS }, slots })

			await user.click(stepButton('Аккаунт'))

			expect(emitted()['step-change']).toBeUndefined()
		})
	})

	describe('загрузка и отключение', () => {
		it('isLoading: «Готово» в загрузке, «Назад» и степпер недоступны, finish не приходит', async () => {
			const user = userEvent.setup()
			const { emitted } = render(BaseFormWizard, { props: { steps: STEPS, step: 'confirm', isLoading: true }, slots })

			expect(finishButton()).toHaveAttribute('aria-busy', 'true')
			expect(screen.getByRole('button', { name: UI_FORM_WIZARD.BACK })).toBeDisabled()
			expect(document.querySelector('.base-stepper__trigger--clickable')).not.toBeInTheDocument()
			await user.click(finishButton())
			await fireEvent.submit(document.querySelector('form') as HTMLFormElement)

			expect(emitted().finish).toBeUndefined()
		})

		it('isDisabled: кнопки недоступны, переходов нет', async () => {
			const user = userEvent.setup()
			const { emitted, container } = render(BaseFormWizard, { props: { steps: STEPS, isDisabled: true }, slots })

			expect(next()).toBeDisabled()
			expect(screen.getByRole('button', { name: UI_FORM_WIZARD.BACK })).toBeDisabled()
			expect(container.querySelector('.base-form-wizard')).toHaveClass('base-form-wizard--disabled')
			expect(container.querySelector('.base-form-wizard')).not.toHaveAttribute('aria-disabled')
			expect(screen.getByRole('group', { name: STEPS[0].title })).toHaveAttribute('aria-disabled', 'true')
			await user.click(next())

			expect(emitted()['step-change']).toBeUndefined()
		})
	})

	describe('оформление', () => {
		it('добавляет модификатор варианта, кроме default', () => {
			const { container } = render(BaseFormWizard, { props: { steps: STEPS, variant: 'soft' }, slots })

			expect(container.querySelector('.base-form-wizard')).toHaveClass('base-form-wizard--soft')
		})

		it('пишет --size-scale только при масштабе, отличном от 100', () => {
			const { container } = render(BaseFormWizard, { props: { steps: STEPS, sizeScale: 125 }, slots })

			expect((container.querySelector('.base-form-wizard') as HTMLElement).style.getPropertyValue('--size-scale')).toBe('1.25')
		})

		it('customClass добавляет классы частям', () => {
			const parts = ['root', 'header', 'content', 'title', 'description', 'actions', 'back', 'skip', 'next']
			const { container } = render(BaseFormWizard, {
				props: {
					steps: [{ ...AB[0], description: 'D', isOptional: true }, AB[1]],
					customClass: Object.fromEntries(parts.map(part => [part, `c-${part}`])),
				},
			})

			for (const part of parts) expect(container.querySelector(`.c-${part}`)).toBeInTheDocument()
		})

		it('ui и customClass добавляют классы сообщению шага', async () => {
			const user = userEvent.setup()
			const { container } = render(BaseFormWizard, {
				props: { steps: [{ ...AB[0], validate: () => 'Нет' }, AB[1]], customClass: { error: 'c-error' }, ui: { error: 'u-error' } },
			})

			await user.click(next())
			await screen.findByRole('alert')

			expect(container.querySelector('.base-form-wizard__error')).toHaveClass('c-error', 'u-error')
		})
	})

	describe('настройки плагина', () => {
		it('defaults.BaseFormWizard переопределяют умолчания', async () => {
			const user = userEvent.setup()
			render(BaseFormWizard, {
				props: { steps: ABC },
				global: { plugins: [createUiKitPlugin({ defaults: { BaseFormWizard: { isLinear: false, variant: 'outline' } } })] },
			})

			await user.click(stepButton('C'))

			expect(await screen.findByRole('heading', { name: 'C' })).toBeInTheDocument()
			expect(document.querySelector('.base-form-wizard')).toHaveClass('base-form-wizard--outline')
		})
	})
})
