/**
 * Integration-тесты для BaseForm.
 * Проверяют взаимодействие: отправка формы.
 */

import '@testing-library/jest-dom/vitest'
import { nextTick, reactive, ref } from 'vue'
import userEvent from '@testing-library/user-event'
import { fireEvent, render, screen, waitFor } from '@testing-library/vue'
import { BaseInput } from '@components/BaseInput'
import { BaseRange } from '@components/BaseRange'
import { BaseEditor } from '@components/BaseEditor'
import { BaseRating } from '@components/BaseRating'
import { BaseSelect } from '@components/BaseSelect'
import { BaseFormField } from '@components/BaseFormField'
import { BaseFileUpload } from '@components/BaseFileUpload'
import BaseForm from '../ui/BaseForm.vue'
import type { BaseFormExpose } from '../types/BaseForm.types'
import type { StandardSchemaResult, StandardSchemaV1 } from '@utils/formUtils'

describe('BaseForm integration', () => {
	describe('отправка формы', () => {
		it('должен эмитить submit при отправке формы', async () => {
			const user = userEvent.setup()
			const { emitted } = render(BaseForm, {
				slots: { default: '<button type="submit">Отправить</button>' },
			})

			await user.click(screen.getByText('Отправить'))

			expect(emitted()).toHaveProperty('submit')
		})

		it('не должен эмитить submit когда isLoading=true', async () => {
			const { container, emitted } = render(BaseForm, {
				props: { isLoading: true },
				slots: { default: '<button type="submit">Отправить</button>' },
			})

			/** pointer-events: none блокирует userEvent, используем fireEvent */
			const form = container.querySelector('form') as HTMLFormElement
			await fireEvent.submit(form)

			expect(emitted()).not.toHaveProperty('submit')
		})

		it('не должен эмитить submit когда isDisabled=true', async () => {
			const { container, emitted } = render(BaseForm, {
				props: { isDisabled: true },
				slots: { default: '<button type="submit">Отправить</button>' },
			})

			const form = container.querySelector('form') as HTMLFormElement
			await fireEvent.submit(form)

			expect(emitted()).not.toHaveProperty('submit')
		})
	})

	describe('блокировка полей', () => {
		const FIELDS = '<input aria-label="Имя" /><button type="submit">Отправить</button>'

		it('isDisabled должен отключать поля формы, в том числе для клавиатуры', async () => {
			const user = userEvent.setup()
			render(BaseForm, {
				props: { isDisabled: true },
				slots: { default: FIELDS },
			})

			const input = screen.getByRole('textbox', { name: 'Имя' })
			expect(input).toBeDisabled()
			expect(screen.getByRole('button', { name: 'Отправить' })).toBeDisabled()

			await user.tab()
			expect(input).not.toHaveFocus()
		})

		it('isLoading должен отключать поля и помечать форму как занятую', () => {
			const { container } = render(BaseForm, {
				props: { isLoading: true },
				slots: { default: FIELDS },
			})

			expect(screen.getByRole('textbox', { name: 'Имя' })).toBeDisabled()
			expect(container.querySelector('form')).toHaveAttribute('aria-busy', 'true')
		})

		/** Кнопка вне формы — для сценариев, где фокус находится или уходит за пределы формы */
		function createOutsideButton(): HTMLButtonElement {
			const button = document.createElement('button')
			button.dataset.outside = ''
			document.body.append(button)
			return button
		}

		/**
		 * Эмулирует focus fixup браузера: фокус с поля, ставшего disabled, уходит на body.
		 * jsdom этого не делает, а blur() у уже отключённого поля игнорирует — переводим фокус через временную кнопку.
		 */
		function emulateFocusFixup(): void {
			const probe = createOutsideButton()
			probe.focus()
			probe.blur()
			probe.remove()
		}

		afterEach(() => {
			document.querySelectorAll('[data-outside]').forEach(element => element.remove())
		})

		it('после снятия isLoading поля снова доступны, а потерянный фокус возвращается на поле', async () => {
			const { rerender } = render(BaseForm, {
				props: { isLoading: false },
				slots: { default: FIELDS },
			})
			const input = screen.getByRole('textbox', { name: 'Имя' })
			input.focus()

			await rerender({ isLoading: true })
			emulateFocusFixup()
			expect(document.body).toHaveFocus()
			await rerender({ isLoading: false })

			expect(input).toBeEnabled()
			expect(input).toHaveFocus()
		})

		it('не должен перехватывать фокус, если за время блокировки его перевели на другой элемент', async () => {
			const outside = createOutsideButton()
			const { rerender } = render(BaseForm, {
				props: { isLoading: false },
				slots: { default: FIELDS },
			})
			screen.getByRole('textbox', { name: 'Имя' }).focus()

			await rerender({ isLoading: true })
			emulateFocusFixup()
			outside.focus()
			await rerender({ isLoading: false })

			expect(outside).toHaveFocus()
		})

		it('не должен переводить фокус после разблокировки, если при блокировке фокус был вне формы', async () => {
			const outside = createOutsideButton()
			const { rerender } = render(BaseForm, {
				props: { isLoading: false },
				slots: { default: FIELDS },
			})
			outside.focus()

			await rerender({ isLoading: true })
			outside.blur()
			await rerender({ isLoading: false })

			expect(document.body).toHaveFocus()
			expect(screen.getByRole('textbox', { name: 'Имя' })).not.toHaveFocus()
		})
	})
})

/** Схема для тестов: имя обязательно, возраст — от 18; `delay` — асинхронная проверка */
function profileSchema(delay?: number): StandardSchemaV1 {
	const check = (value: unknown): StandardSchemaResult<unknown> => {
		const data = value as { name: string; age: number }
		const issues = []
		if (!data.name) issues.push({ message: 'Введите имя', path: ['name'] })
		if (data.age < 18) issues.push({ message: 'С 18 лет', path: ['age'] })
		return issues.length ? { issues } : { value: { ...data, name: data.name.trim() } }
	}
	return {
		'~standard': {
			version: 1,
			vendor: 'test',
			validate: value =>
				delay === undefined ? check(value) : new Promise(resolve => setTimeout(() => resolve(check(value)), delay)),
		},
	}
}

describe('BaseForm: проверка по схеме (Standard Schema)', () => {
	function renderProfile(schema = profileSchema()) {
		const state = reactive({ name: '', age: 16 })
		const onSubmit = vi.fn()
		const onInvalid = vi.fn()
		const form = ref<BaseFormExpose | null>(null)
		const utils = render({
			components: { BaseForm, BaseFormField, BaseInput },
			setup: () => ({ schema, state, onSubmit, onInvalid, form }),
			template: `
				<BaseForm ref="form" :schema="schema" :state="state" @submit="onSubmit" @invalid="onInvalid">
					<BaseFormField label="Имя" name="name"><BaseInput v-model="state.name" /></BaseFormField>
					<BaseFormField label="Возраст" name="age"><BaseInput v-model="state.age" type="number" /></BaseFormField>
					<button type="submit">Сохранить</button>
				</BaseForm>
			`,
		})
		return { ...utils, state, onSubmit, onInvalid, form }
	}

	it('ошибки — у полей с тем же name, событие invalid, фокус на первом поле с ошибкой; submit не приходит', async () => {
		const user = userEvent.setup()
		const { onSubmit, onInvalid } = renderProfile()

		await user.click(screen.getByRole('button', { name: 'Сохранить' }))

		await waitFor(() =>
			expect(onInvalid).toHaveBeenCalledWith([
				{ name: 'name', message: 'Введите имя' },
				{ name: 'age', message: 'С 18 лет' },
			]),
		)
		expect(screen.getByText('Введите имя')).toBeInTheDocument()
		expect(screen.getByText('С 18 лет')).toBeInTheDocument()
		await waitFor(() => expect(screen.getByRole('textbox', { name: 'Имя' })).toHaveFocus())
		expect(onSubmit).not.toHaveBeenCalled()
	})

	it('после первой отправки ошибка исчезает, как только поле исправлено; submit получает данные после схемы', async () => {
		const user = userEvent.setup()
		const { onSubmit, state } = renderProfile()

		await user.click(screen.getByRole('button', { name: 'Сохранить' }))
		await screen.findByText('Введите имя')
		await user.type(screen.getByRole('textbox', { name: 'Имя' }), ' Анна ')
		await waitFor(() => expect(screen.queryByText('Введите имя')).not.toBeInTheDocument())
		expect(screen.getByText('С 18 лет')).toBeInTheDocument()

		state.age = 30
		await waitFor(() => expect(screen.queryByText('С 18 лет')).not.toBeInTheDocument())
		await user.click(screen.getByRole('button', { name: 'Сохранить' }))

		await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1))
		expect(onSubmit.mock.calls[0][1]).toEqual({ name: 'Анна', age: 30 })
	})

	it('до первой отправки ввод не проверяется', async () => {
		const user = userEvent.setup()
		renderProfile()

		const name = await screen.findByRole('textbox', { name: 'Имя' })
		await user.type(name, 'А')
		await user.clear(name)

		expect(screen.queryByText('Введите имя')).not.toBeInTheDocument()
	})

	it('validate() и reset() через ref: ошибки показываются и убираются', async () => {
		const { form } = renderProfile()

		const result = await form.value!.validate()
		expect(result.issues).toHaveLength(2)
		expect(await screen.findByText('Введите имя')).toBeInTheDocument()
		expect(form.value!.errors).toEqual({ name: 'Введите имя', age: 'С 18 лет' })

		form.value!.reset()
		await waitFor(() => expect(screen.queryByText('Введите имя')).not.toBeInTheDocument())
		expect(form.value!.errors).toEqual({})
	})

	it('асинхронная схема: устаревший ответ не перезаписывает ошибки новой проверки', async () => {
		vi.useFakeTimers()
		const { form, state } = renderProfile(profileSchema(100))

		const first = form.value!.validate()
		state.name = 'Анна'
		state.age = 20
		const second = form.value!.validate()
		await vi.advanceTimersByTimeAsync(100)
		await Promise.all([first, second])

		expect(form.value!.errors).toEqual({})
		vi.useRealTimers()
	})

	it('без схемы submit получает state; validate() — успех', async () => {
		const user = userEvent.setup()
		const onSubmit = vi.fn()
		const form = ref<BaseFormExpose | null>(null)
		render({
			components: { BaseForm },
			setup: () => ({ onSubmit, form, state: { city: 'Казань' } }),
			template: '<BaseForm ref="form" :state="state" @submit="onSubmit"><button type="submit">Ок</button></BaseForm>',
		})

		await user.click(screen.getByRole('button', { name: 'Ок' }))

		expect(onSubmit.mock.calls[0][1]).toEqual({ city: 'Казань' })
		await expect(form.value!.validate()).resolves.toEqual({ value: { city: 'Казань' }, issues: [] })
	})

	it('заблокированная форма со схемой не проверяет и не отправляет', async () => {
		const onSubmit = vi.fn()
		const onInvalid = vi.fn()
		const { container } = render(BaseForm, {
			props: { isDisabled: true, schema: profileSchema(), state: { name: '', age: 1 }, onSubmit, onInvalid },
		})

		await fireEvent.submit(container.querySelector('form') as HTMLFormElement)

		expect(onSubmit).not.toHaveBeenCalled()
		expect(onInvalid).not.toHaveBeenCalled()
	})
})

describe('BaseForm: блокировка кастомных контролов (FORM-1)', () => {
	it('в отключённой форме заблокированы Select, Range, Rating, FileUpload, Editor — только чтение', async () => {
		const isDisabled = ref(true)
		const { container } = render({
			components: { BaseForm, BaseSelect, BaseRange, BaseRating, BaseFileUpload, BaseEditor },
			setup: () => ({ isDisabled, options: [{ value: 'a', label: 'А' }] }),
			template: `
				<BaseForm :is-disabled="isDisabled">
					<BaseSelect model-value="" :options="options" label="Статус" />
					<BaseRange :model-value="10" aria-label="Громкость" />
					<BaseRating :model-value="3" />
					<BaseFileUpload />
					<BaseEditor model-value="<p>Текст</p>" />
				</BaseForm>
			`,
		})

		expect(screen.getByRole('combobox', { name: 'Статус' })).toHaveAttribute('aria-disabled', 'true')
		expect(container.querySelector('.base-range')).toHaveClass('base-range--disabled')
		expect(container.querySelector('.base-rating')).toHaveClass('base-rating--disabled')
		expect(container.querySelector('.base-file-upload')).toHaveClass('base-file-upload--disabled')
		expect(container.querySelector('[contenteditable]')).toHaveAttribute('contenteditable', 'false')

		isDisabled.value = false
		await nextTick()
		expect(screen.getByRole('combobox', { name: 'Статус' })).not.toHaveAttribute('aria-disabled')
		expect(container.querySelector('[contenteditable]')).toHaveAttribute('contenteditable', 'true')
	})
})
