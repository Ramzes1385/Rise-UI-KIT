import { describe, it, expect } from 'vitest'
import { ref, nextTick } from 'vue'
import { UI_TEXT } from '@constants'
import { useFormField } from './useFormField'

describe('useFormField', () => {
	describe('начальное состояние', () => {
		it('не touched, не dirty, нет ошибки, валиден', () => {
			const field = useFormField({ value: () => 'hello' })
			expect(field.isTouched).toBe(false)
			expect(field.isDirty).toBe(false)
			expect(field.error).toBe('')
			expect(field.isValid).toBe(true)
		})
	})

	describe('onBlur', () => {
		it('устанавливает touched', () => {
			const field = useFormField({ value: () => '' })
			expect(field.isTouched).toBe(false)
			field.onBlur()
			expect(field.isTouched).toBe(true)
		})
	})

	describe('validate', () => {
		it('устанавливает touched и возвращает true для валидного значения', () => {
			const field = useFormField({
				value: () => 'hello',
				isRequired: () => true,
			})
			expect(field.validate()).toBe(true)
			expect(field.isTouched).toBe(true)
		})

		it('возвращает false для пустого required поля', () => {
			const field = useFormField({
				value: () => '',
				isRequired: () => true,
			})
			expect(field.validate()).toBe(false)
		})

		it('возвращает false для null required поля', () => {
			const field = useFormField({
				value: () => null,
				isRequired: () => true,
			})
			expect(field.validate()).toBe(false)
		})

		it('возвращает false при нарушении правила', () => {
			const field = useFormField({
				value: () => 'ab',
				rules: [{ validate: (v) => String(v).length >= 3, message: 'Минимум 3 символа' }],
			})
			expect(field.validate()).toBe(false)
			expect(field.error).toBe('Минимум 3 символа')
		})

		it('возвращает true когда все правила пройдены', () => {
			const field = useFormField({
				value: () => 'hello',
				rules: [{ validate: (v) => String(v).length >= 3, message: 'Минимум 3 символа' }],
			})
			expect(field.validate()).toBe(true)
			expect(field.error).toBe('')
		})
	})

	describe('reset', () => {
		it('сбрасывает touched и dirty', () => {
			const val = ref('initial')
			const field = useFormField({ value: () => val.value })

			field.onBlur()
			val.value = 'changed'
			expect(field.isTouched).toBe(true)

			field.reset()
			expect(field.isTouched).toBe(false)
			expect(field.isDirty).toBe(false)
		})
	})

	describe('внешняя ошибка', () => {
		it('имеет приоритет над внутренней валидацией', () => {
			const externalError = ref('Серверная ошибка')
			const field = useFormField({
				value: () => 'valid',
				error: () => externalError.value,
				isRequired: () => true,
			})
			expect(field.error).toBe('Серверная ошибка')
			expect(field.isValid).toBe(false)
		})

		it('возвращает пустую строку когда внешняя ошибка убрана', () => {
			const externalError = ref<string | undefined>('Ошибка')
			const field = useFormField({
				value: () => 'hello',
				error: () => externalError.value,
			})
			expect(field.error).toBe('Ошибка')

			externalError.value = undefined
			expect(field.error).toBe('')
		})
	})

	describe('required валидация', () => {
		it('показывает ошибку после touch для пустой required строки', () => {
			const field = useFormField({
				value: () => '',
				isRequired: () => true,
			})
			field.onBlur()
			expect(field.error).toBe(UI_TEXT.REQUIRED_FIELD)
		})

		it('не показывает ошибку до touch', () => {
			const field = useFormField({
				value: () => '',
				isRequired: () => true,
			})
			expect(field.error).toBe('')
		})

		it('нет ошибки для непустого required поля', () => {
			const field = useFormField({
				value: () => 'value',
				isRequired: () => true,
			})
			field.onBlur()
			expect(field.error).toBe('')
		})
	})

	describe('кастомные правила', () => {
		it('проверяет правила после touch', () => {
			const field = useFormField({
				value: () => 'abc',
				rules: [
					{ validate: (v) => String(v).length >= 5, message: 'Минимум 5 символов' },
				],
			})
			field.onBlur()
			expect(field.error).toBe('Минимум 5 символов')
		})

		it('проверяет несколько правил по порядку', () => {
			const field = useFormField({
				value: () => 'ab',
				rules: [
					{ validate: (v) => String(v).length >= 3, message: 'Минимум 3 символа' },
					{ validate: (v) => String(v).length <= 10, message: 'Максимум 10 символов' },
				],
			})
			field.onBlur()
			expect(field.error).toBe('Минимум 3 символа')
		})

		it('нет ошибки когда все правила пройдены', () => {
			const field = useFormField({
				value: () => 'hello',
				rules: [
					{ validate: (v) => String(v).length >= 3, message: 'Минимум 3 символа' },
					{ validate: (v) => String(v).length <= 10, message: 'Максимум 10 символов' },
				],
			})
			field.onBlur()
			expect(field.error).toBe('')
		})
	})

	describe('dirty tracking', () => {
		it('становится dirty при изменении значения', async () => {
			const val = ref('initial')
			const field = useFormField({ value: () => val.value })
			expect(field.isDirty).toBe(false)

			val.value = 'changed'
			await nextTick()
			expect(field.isDirty).toBe(true)
		})

		it('не dirty если значение не менялось', async () => {
			const val = ref('initial')
			const field = useFormField({ value: () => val.value })

			await nextTick()
			expect(field.isDirty).toBe(false)
		})
	})
})
