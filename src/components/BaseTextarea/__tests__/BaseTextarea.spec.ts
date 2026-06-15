/**
 * Unit-тесты для BaseTextarea.
 * Проверяют рендер, пропсы, CSS-модификаторы, emits и поведенческую логику.
 */

import '@testing-library/jest-dom/vitest'
import { fireEvent, render, screen } from '@testing-library/vue'

import BaseTextarea from '../ui/BaseTextarea.vue'

describe('BaseTextarea unit', () => {
	describe('рендер', () => {
		it('должен рендерить текстовую область', () => {
			render(BaseTextarea, { props: { modelValue: '' } })

			expect(screen.getByRole('textbox')).toBeInTheDocument()
		})

		it('должен отображать placeholder', () => {
			render(BaseTextarea, { props: { modelValue: '', placeholder: 'Введите текст' } })

			expect(screen.getByPlaceholderText('Введите текст')).toBeInTheDocument()
		})

		it('должен отображать значение modelValue', () => {
			render(BaseTextarea, { props: { modelValue: 'Текст' } })

			expect(screen.getByDisplayValue('Текст')).toBeInTheDocument()
		})
	})

	describe('пропс rows', () => {
		it('должен устанавливать rows=4 по умолчанию', () => {
			render(BaseTextarea, { props: { modelValue: '' } })

			expect(screen.getByRole('textbox')).toHaveAttribute('rows', '4')
		})

		it('должен устанавливать переданное количество строк', () => {
			render(BaseTextarea, { props: { modelValue: '', rows: 8 } })

			expect(screen.getByRole('textbox')).toHaveAttribute('rows', '8')
		})
	})

	describe('пропс isDisabled', () => {
		it('должен быть disabled когда isDisabled=true', () => {
			render(BaseTextarea, { props: { modelValue: '', isDisabled: true } })

			expect(screen.getByRole('textbox')).toBeDisabled()
		})

		it('должен добавлять класс --disabled когда isDisabled=true', () => {
			const { container } = render(BaseTextarea, {
				props: { modelValue: '', isDisabled: true },
			})

			expect(container.firstElementChild?.classList.contains('base-textarea--disabled')).toBe(true)
		})

		it('не должен быть disabled по умолчанию', () => {
			render(BaseTextarea, { props: { modelValue: '' } })

			expect(screen.getByRole('textbox')).not.toBeDisabled()
		})
	})

	describe('пропс error', () => {
		it('должен добавлять класс --error когда error передан', () => {
			const { container } = render(BaseTextarea, {
				props: { modelValue: '', error: 'Обязательное поле' },
			})

			expect(container.firstElementChild?.classList.contains('base-textarea--error')).toBe(true)
		})

		it('должен отображать текст ошибки', () => {
			render(BaseTextarea, {
				props: { modelValue: '', error: 'Обязательное поле' },
			})

			expect(screen.getByText('Обязательное поле')).toBeInTheDocument()
		})

		it('не должен добавлять класс --error по умолчанию', () => {
			const { container } = render(BaseTextarea, { props: { modelValue: '' } })

			expect(container.firstElementChild?.classList.contains('base-textarea--error')).toBe(false)
		})
	})

	describe('пропс label', () => {
		it('должен отображать метку', () => {
			render(BaseTextarea, {
				props: { modelValue: '', label: 'Описание' },
			})

			expect(screen.getByText('Описание')).toBeInTheDocument()
		})

		it('должен отображать звёздочку для обязательного поля', () => {
			render(BaseTextarea, {
				props: { modelValue: '', label: 'Описание', isRequired: true },
			})

			expect(screen.getByText('*')).toBeInTheDocument()
		})
	})

	describe('пропс isReadonly', () => {
		it('должен быть readonly когда isReadonly=true', () => {
			render(BaseTextarea, { props: { modelValue: '', isReadonly: true } })

			expect(screen.getByRole('textbox')).toHaveAttribute('readonly')
		})
	})

	describe('пропс maxlength', () => {
		it('должен устанавливать maxlength', () => {
			render(BaseTextarea, { props: { modelValue: '', maxlength: 100 } })

			expect(screen.getByRole('textbox')).toHaveAttribute('maxlength', '100')
		})
	})

	describe('пропс isAutosize', () => {
		it('не должен добавлять класс --autosize по умолчанию', () => {
			const { container } = render(BaseTextarea, { props: { modelValue: '' } })

			expect(container.firstElementChild?.classList.contains('base-textarea--autosize')).toBe(false)
		})

		it('должен добавлять класс --autosize когда isAutosize=true', () => {
			const { container } = render(BaseTextarea, {
				props: { modelValue: '', isAutosize: true },
			})

			expect(container.firstElementChild?.classList.contains('base-textarea--autosize')).toBe(true)
		})
	})

	describe('пропс sizeScale', () => {
		it('не должен устанавливать --size-scale когда sizeScale=100', () => {
			const { container } = render(BaseTextarea, {
				props: { modelValue: '', sizeScale: 100 },
			})

			const el = container.firstElementChild as HTMLElement
			expect(el.style.getPropertyValue('--size-scale')).toBe('')
		})

		it('должен устанавливать --size-scale когда sizeScale=150', () => {
			const { container } = render(BaseTextarea, {
				props: { modelValue: '', sizeScale: 150 },
			})

			const el = container.firstElementChild as HTMLElement
			expect(el.style.getPropertyValue('--size-scale')).toBe('1.5')
		})

		it('должен устанавливать --size-scale когда sizeScale=75', () => {
			const { container } = render(BaseTextarea, {
				props: { modelValue: '', sizeScale: 75 },
			})

			const el = container.firstElementChild as HTMLElement
			expect(el.style.getPropertyValue('--size-scale')).toBe('0.75')
		})
	})

	describe('пропс variant', () => {
		it('должен добавлять класс варианта --outline', () => {
			const { container } = render(BaseTextarea, {
				props: { modelValue: '', variant: 'outline' },
			})

			expect(container.firstElementChild?.classList.contains('base-textarea--outline')).toBe(true)
		})

		it('должен добавлять класс варианта --ghost', () => {
			const { container } = render(BaseTextarea, {
				props: { modelValue: '', variant: 'ghost' },
			})

			expect(container.firstElementChild?.classList.contains('base-textarea--ghost')).toBe(true)
		})
	})

	describe('пропс name', () => {
		it('должен устанавливать атрибут name', () => {
			render(BaseTextarea, {
				props: { modelValue: '', name: 'description' },
			})

			expect(screen.getByRole('textbox')).toHaveAttribute('name', 'description')
		})

		it('не должен устанавливать атрибут name по умолчанию', () => {
			render(BaseTextarea, { props: { modelValue: '' } })

			expect(screen.getByRole('textbox')).not.toHaveAttribute('name')
		})
	})

	describe('emits', () => {
		it('должен эмиссить update:modelValue при вводе', async () => {
			const { emitted } = render(BaseTextarea, {
				props: { modelValue: '' },
			})

			await fireEvent.update(screen.getByRole('textbox'), 'Новый текст')

			expect(emitted()['update:modelValue']).toBeTruthy()
			expect(emitted()['update:modelValue'][0]).toEqual(['Новый текст'])
		})

		it('должен эмиссить blur при потере фокуса', async () => {
			const { emitted } = render(BaseTextarea, {
				props: { modelValue: '' },
			})

			await fireEvent.blur(screen.getByRole('textbox'))

			expect(emitted().blur).toBeTruthy()
		})

		it('должен эмиссить focus при получении фокуса', async () => {
			const { emitted } = render(BaseTextarea, {
				props: { modelValue: '' },
			})

			await fireEvent.focus(screen.getByRole('textbox'))

			expect(emitted().focus).toBeTruthy()
		})
	})

	describe('isAutosize — поведенческие тесты', () => {
		it('должен вызывать adjustHeight при монтировании с isAutosize=true', async () => {
			const { container } = render(BaseTextarea, {
				props: { modelValue: 'Текст', isAutosize: true },
			})

			await vi.dynamicImportSettled()

			const textarea = container.querySelector('textarea') as HTMLTextAreaElement
			expect(textarea.style.height).toMatch(/^\d+px$/)
		})

		it('не должен менять высоту при монтировании без isAutosize', () => {
			const { container } = render(BaseTextarea, {
				props: { modelValue: 'Текст' },
			})

			const textarea = container.querySelector('textarea') as HTMLTextAreaElement
			expect(textarea.style.height).toBe('')
		})

		it('должен подстраивать высоту при изменении modelValue с isAutosize', async () => {
			const { rerender, container } = render(BaseTextarea, {
				props: { modelValue: '', isAutosize: true },
			})

			await rerender({ modelValue: 'Длинный текст для проверки автоподстройки высоты' })

			const textarea = container.querySelector('textarea') as HTMLTextAreaElement
			expect(textarea.style.height).not.toBe('')
		})

		it('не должен подстраивать высоту при изменении modelValue без isAutosize', async () => {
			const { rerender, container } = render(BaseTextarea, {
				props: { modelValue: '' },
			})

			await rerender({ modelValue: 'Длинный текст' })

			const textarea = container.querySelector('textarea') as HTMLTextAreaElement
			expect(textarea.style.height).toBe('')
		})

		it('должен подстраивать высоту при вводе текста с isAutosize=true', async () => {
			const { container } = render(BaseTextarea, {
				props: { modelValue: '', isAutosize: true },
			})

			const textarea = container.querySelector('textarea') as HTMLTextAreaElement
			const initialHeight = textarea.style.height

			await fireEvent.update(textarea, 'Длинный текст для проверки автоподстройки высоты при вводе')

			await vi.dynamicImportSettled()

			expect(textarea.style.height).not.toBe(initialHeight)
		})

		it('не должен падать когда adjustHeight вызван без DOM-элемента (el=null)', () => {
			const { container } = render(BaseTextarea, {
				props: { modelValue: '', isAutosize: true },
			})

			// Получаем expose через внутренний механизм Vue 3 на корневом элементе
			const root = container.firstElementChild as HTMLElement & {
				__vueParentComponent?: {
					exposed?: {
						textareaRef: { value: HTMLTextAreaElement | null }
						adjustHeight: () => void
					}
				}
			}

			const exposed = root.__vueParentComponent?.exposed
			expect(exposed).toBeDefined()

			// Явно обнуляем ref чтобы проверить guard-ветку !el
			exposed!.textareaRef.value = null

			// Вызов adjustHeight не должен падать — ветка !el просто делает return
			expect(() => exposed!.adjustHeight()).not.toThrow()
		})
	})

	describe('пропс customClass', () => {
		it('должен добавлять строку класса к корневому элементу', () => {
			const { container } = render(BaseTextarea, {
				props: {
					modelValue: '',
					customClass: 'custom-textarea-class',
				},
			})

			const root = container.firstElementChild
			expect(root).toHaveClass('custom-textarea-class')
		})

		it('должен распределять объект классов по внутренним элементам', () => {
			const { container } = render(BaseTextarea, {
				props: {
					modelValue: '',
					label: 'Label',
					isRequired: true,
					error: 'Error text',
					customClass: {
						root: 'custom-root',
						label: 'custom-label',
						required: 'custom-required',
						field: 'custom-field',
						errorText: 'custom-error',
					},
				},
			})

			const root = container.firstElementChild
			expect(root).toHaveClass('custom-root')

			const label = container.querySelector('.base-textarea__label')
			expect(label).toHaveClass('custom-label')

			const required = container.querySelector('.base-textarea__required')
			expect(required).toHaveClass('custom-required')

			const field = container.querySelector('.base-textarea__field')
			expect(field).toHaveClass('custom-field')

			const errorText = container.querySelector('.base-textarea__error-text')
			expect(errorText).toHaveClass('custom-error')
		})
	})
})
