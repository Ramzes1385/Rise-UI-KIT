import '@testing-library/jest-dom/vitest'
import { defineComponent } from 'vue'
import BasePromptInput from '../ui/BasePromptInput.vue'
import { fireEvent, render, screen } from '@testing-library/vue'

describe('BasePromptInput: кнопки на BaseButton', () => {
	it('«Отправить»: type=button с прежним классом, неактивна без текста, с текстом клик эмитит submit', async () => {
		const { emitted } = render(BasePromptInput)
		const send = screen.getByRole('button', { name: 'Отправить' })

		expect(send).toHaveAttribute('type', 'button')
		expect(send).toHaveClass('base-prompt-input__button')
		expect(send).not.toHaveClass('base-prompt-input__button--stop')
		expect(send).toBeDisabled()
		await fireEvent.update(screen.getByRole('textbox', { name: 'Сообщение' }), '   ')
		expect(send).toBeDisabled()
		await fireEvent.update(screen.getByRole('textbox', { name: 'Сообщение' }), 'Привет')
		expect(send).toBeEnabled()
		await fireEvent.click(send)
		expect(emitted('submit')).toEqual([['Привет']])
	})

	it('isGenerating: вместо «Отправить» — «Остановить ответ», клик эмитит stop; при isDisabled неактивна', async () => {
		const { emitted, rerender } = render(BasePromptInput, { props: { modelValue: 'Текст', isGenerating: true } })
		const stop = screen.getByRole('button', { name: 'Остановить ответ' })

		expect(screen.queryByRole('button', { name: 'Отправить' })).toBeNull()
		expect(stop).toHaveAttribute('type', 'button')
		expect(stop).toHaveClass('base-prompt-input__button', 'base-prompt-input__button--stop')
		expect(stop).toBeEnabled()
		await fireEvent.click(stop)
		expect(emitted('stop')).toEqual([[]])
		expect(emitted('submit')).toBeUndefined()
		await rerender({ modelValue: 'Текст', isGenerating: true, isDisabled: true })
		expect(screen.getByRole('button', { name: 'Остановить ответ' })).toBeDisabled()
		await rerender({ modelValue: 'Текст', isGenerating: false, isDisabled: true })
		expect(screen.getByRole('button', { name: 'Отправить' })).toBeDisabled()
	})

	it('«Отправить» внутри формы не отправляет её', async () => {
		const onSubmit = vi.fn((event: Event) => event.preventDefault())
		const Host = defineComponent({
			components: { BasePromptInput },
			setup: () => ({ onSubmit }),
			template: '<form @submit="onSubmit"><BasePromptInput model-value="Текст" /></form>',
		})
		render(Host)
		const send = screen.getByRole('button', { name: 'Отправить' })

		expect(send.closest('form')).not.toBeNull()
		await fireEvent.click(send)
		expect(onSubmit).not.toHaveBeenCalled()
	})

	it('кнопка «Остановить ответ» внутри формы тоже не отправляет её', async () => {
		const onSubmit = vi.fn((event: Event) => event.preventDefault())
		const Host = defineComponent({
			components: { BasePromptInput },
			setup: () => ({ onSubmit }),
			template: '<form @submit="onSubmit"><BasePromptInput model-value="Текст" is-generating /></form>',
		})
		render(Host)

		await fireEvent.click(screen.getByRole('button', { name: 'Остановить ответ' }))
		expect(onSubmit).not.toHaveBeenCalled()
	})
})
