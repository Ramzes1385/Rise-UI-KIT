import '@testing-library/jest-dom/vitest'
import { defineComponent, h } from 'vue'
import BasePromptInput from '../ui/BasePromptInput.vue'
import { isSubmitKey } from '../model/useBasePromptInput'
import { BaseFormField } from '@components/BaseFormField'
import { fireEvent, render, screen } from '@testing-library/vue'

describe('BasePromptInput', () => {
	it('без подписи — имя «Сообщение», подсказка про Enter в описании, отправка неактивна', () => {
		const { container } = render(BasePromptInput)
		const field = screen.getByRole('textbox', { name: 'Сообщение' })

		expect(field).toHaveAttribute('placeholder', 'Спросите что-нибудь…')
		expect(field).toHaveAttribute('rows', '1')
		expect(field).toHaveAttribute('enterkeyhint', 'send')
		expect(field).toHaveAccessibleDescription('Enter — отправить, Shift+Enter — новая строка')
		expect(screen.getByRole('button', { name: 'Отправить' })).toBeDisabled()
		expect(container.querySelector('.base-prompt-input')).toHaveStyle({ '--prompt-max-rows': '8' })
		expect(container.querySelector('.base-prompt-input__start')).toBeNull()
	})

	it('подпись, placeholder, name, maxlength и ошибка', () => {
		render(BasePromptInput, {
			props: { label: 'Вопрос', placeholder: 'Пишите', name: 'prompt', maxlength: 10, error: 'Слишком длинно' },
		})
		const field = screen.getByRole('textbox', { name: 'Вопрос' })

		expect(field).not.toHaveAttribute('aria-label')
		expect(field).toHaveAttribute('placeholder', 'Пишите')
		expect(field).toHaveAttribute('name', 'prompt')
		expect(field).toHaveAttribute('maxlength', '10')
		expect(field).toHaveAttribute('aria-invalid', 'true')
		expect(field).toHaveAccessibleDescription('Слишком длинно Enter — отправить, Shift+Enter — новая строка')
	})

	it('ввод обновляет v-model; Enter отправляет и очищает поле, фокус остаётся', async () => {
		const { emitted } = render(BasePromptInput)
		const field = screen.getByRole('textbox')

		await fireEvent.update(field, '  Привет  ')
		expect(screen.getByRole('button', { name: 'Отправить' })).toBeEnabled()
		field.focus()
		await fireEvent.keyDown(field, { key: 'Enter' })
		expect(emitted('submit')).toEqual([['  Привет  ']])
		expect(emitted('update:modelValue')).toEqual([['  Привет  '], ['']])
		expect(field).toHaveValue('')
		expect(field).toHaveFocus()
	})

	it('кнопка «Отправить» отправляет; пробелы и Shift+Enter не отправляют', async () => {
		const { emitted } = render(BasePromptInput, { props: { modelValue: '   ' } })
		const field = screen.getByRole('textbox')

		await fireEvent.keyDown(field, { key: 'Enter' })
		await fireEvent.update(field, 'Вопрос')
		await fireEvent.keyDown(field, { key: 'Enter', shiftKey: true })
		expect(emitted('submit')).toBeUndefined()
		await fireEvent.click(screen.getByRole('button', { name: 'Отправить' }))
		expect(emitted('submit')).toEqual([['Вопрос']])
	})

	it('v-model снаружи меняет текст', async () => {
		const { rerender } = render(BasePromptInput, { props: { modelValue: 'Черновик' } })

		expect(screen.getByRole('textbox')).toHaveValue('Черновик')
		await rerender({ modelValue: undefined })
		expect(screen.getByRole('textbox')).toHaveValue('')
	})

	it('is-generating: «Остановить ответ», Enter не отправляет', async () => {
		const { emitted, container } = render(BasePromptInput, { props: { modelValue: 'Ещё', isGenerating: true } })

		await fireEvent.keyDown(screen.getByRole('textbox'), { key: 'Enter' })
		expect(emitted('submit')).toBeUndefined()
		expect(screen.queryByRole('button', { name: 'Отправить' })).toBeNull()
		await fireEvent.click(screen.getByRole('button', { name: 'Остановить ответ' }))
		expect(emitted('stop')).toHaveLength(1)
		expect(container.querySelector('.base-prompt-input__button--stop')).toBeInTheDocument()
	})

	it('is-disabled отключает поле и кнопки', () => {
		const { container, rerender } = render(BasePromptInput, { props: { modelValue: 'Текст', isDisabled: true } })

		expect(screen.getByRole('textbox')).toBeDisabled()
		expect(screen.getByRole('button', { name: 'Отправить' })).toBeDisabled()
		expect(container.querySelector('.base-prompt-input')).toHaveClass('base-prompt-input--disabled')
		return rerender({ isGenerating: true }).then(() => {
			expect(screen.getByRole('button', { name: 'Остановить ответ' })).toBeDisabled()
		})
	})

	it('слоты start и end', () => {
		render(BasePromptInput, {
			slots: { start: '<button type="button">Файл</button>', end: '<button type="button">Голос</button>' },
		})

		const buttons = screen.getAllByRole('button').map(button => button.textContent || button.getAttribute('aria-label'))
		expect(buttons).toEqual(['Файл', 'Голос', 'Отправить'])
	})

	it('высота подстраивается под текст', async () => {
		render(BasePromptInput)
		const field = screen.getByRole('textbox')
		Object.defineProperty(field, 'scrollHeight', { configurable: true, value: 72 })

		await fireEvent.update(field, 'раз\nдва\nтри')
		await new Promise(resolve => setTimeout(resolve))
		expect(field.style.height).toBe('72px')
	})

	it('внутри BaseFormField берёт подпись поля', async () => {
		const Wrapper = defineComponent(() => () => h(BaseFormField, { label: 'Запрос' }, () => h(BasePromptInput)))
		render(Wrapper)

		expect(await screen.findByRole('textbox', { name: 'Запрос' })).not.toHaveAttribute('aria-label')
	})

	it('вариант, масштаб, max-rows и customClass', () => {
		const { container } = render(BasePromptInput, {
			props: {
				variant: 'soft',
				sizeScale: 125,
				maxRows: 4,
				customClass: { root: 'r', box: 'b', control: 'c', toolbar: 't', label: 'l', error: 'e' },
				label: 'Вопрос',
				error: 'Ошибка',
			},
		})
		const root = container.querySelector('.base-prompt-input') as HTMLElement

		expect(root).toHaveClass('base-prompt-input--soft', 'base-prompt-input--error', 'r')
		expect(root.style.getPropertyValue('--size-scale')).toBe('1.25')
		expect(root.style.getPropertyValue('--prompt-max-rows')).toBe('4')
		expect(container.querySelector('.base-prompt-input__box')).toHaveClass('b')
		expect(container.querySelector('textarea')).toHaveClass('c')
		expect(container.querySelector('.base-prompt-input__toolbar')).toHaveClass('t')
		expect(container.querySelector('label')).toHaveClass('l')
		expect(container.querySelector('.base-prompt-input__error')).toHaveClass('e')
	})

	it('isSubmitKey: Enter без Shift и вне IME', () => {
		expect(isSubmitKey(new KeyboardEvent('keydown', { key: 'Enter' }))).toBe(true)
		expect(isSubmitKey(new KeyboardEvent('keydown', { key: 'Enter', shiftKey: true }))).toBe(false)
		expect(isSubmitKey(new KeyboardEvent('keydown', { key: 'Enter', isComposing: true }))).toBe(false)
		expect(isSubmitKey(new KeyboardEvent('keydown', { key: 'Enter', keyCode: 229 }))).toBe(false)
		expect(isSubmitKey(new KeyboardEvent('keydown', { key: 'a' }))).toBe(false)
	})
})
