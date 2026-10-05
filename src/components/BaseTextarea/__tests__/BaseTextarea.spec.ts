import '@testing-library/jest-dom/vitest'
import BaseTextarea from '../ui/BaseTextarea.vue'
import { defineComponent, h, nextTick, ref } from 'vue'
import { fireEvent, render, screen } from '@testing-library/vue'

function emulateScrollHeight(textarea: HTMLTextAreaElement, getContentHeight: () => number): void {
	Object.defineProperty(textarea, 'scrollHeight', {
		configurable: true,
		get: () => {
			const height = Number.parseFloat(textarea.style.height)
			if (textarea.style.height === 'auto' || Number.isNaN(height)) return getContentHeight()
			return Math.max(getContentHeight(), height)
		},
	})
}

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

		it('связывает label с полем: поле находится по тексту метки и получает её как доступное имя', () => {
			render(BaseTextarea, { props: { modelValue: '', label: 'Описание' } })

			const field = screen.getByLabelText('Описание')
			expect(field.tagName).toBe('TEXTAREA')
			expect(field).toHaveAccessibleName('Описание')
		})

		it('помечает обязательное поле aria-required', () => {
			render(BaseTextarea, { props: { modelValue: '', label: 'Описание', isRequired: true } })

			expect(screen.getByRole('textbox')).toHaveAttribute('aria-required', 'true')
		})
	})

	describe('доступность ошибки', () => {
		it('помечает поле aria-invalid и связывает с текстом ошибки через aria-describedby', () => {
			render(BaseTextarea, { props: { modelValue: '', label: 'Описание', error: 'Опишите товар' } })

			const field = screen.getByLabelText('Описание')
			expect(field).toHaveAttribute('aria-invalid', 'true')
			expect(field).toHaveAccessibleDescription('Опишите товар')
		})

		it('без ошибки не ставит aria-invalid и aria-describedby', () => {
			render(BaseTextarea, { props: { modelValue: '', label: 'Описание' } })

			const field = screen.getByLabelText('Описание')
			expect(field).not.toHaveAttribute('aria-invalid')
			expect(field).not.toHaveAttribute('aria-describedby')
		})
	})

	describe('пропс isReadonly', () => {
		it('должен быть readonly когда isReadonly=true', () => {
			render(BaseTextarea, { props: { modelValue: '', isReadonly: true } })

			expect(screen.getByRole('textbox')).toHaveAttribute('readonly')
		})

		it('должен добавлять класс --readonly когда isReadonly=true', () => {
			const { container } = render(BaseTextarea, { props: { modelValue: '', isReadonly: true } })

			expect(container.firstElementChild).toHaveClass('base-textarea--readonly')
		})
	})

	describe('пропс maxlength', () => {
		it('должен устанавливать maxlength', () => {
			render(BaseTextarea, { props: { modelValue: '', maxlength: 100 } })

			expect(screen.getByRole('textbox')).toHaveAttribute('maxlength', '100')
		})

		it('показывает счётчик «введено/максимум» и описывает им поле', () => {
			render(BaseTextarea, { props: { modelValue: 'Привет', label: 'Подпись', maxlength: 40 } })

			const field = screen.getByLabelText('Подпись')
			expect(screen.getByText('6/40')).toHaveClass('base-textarea__counter')
			expect(field).toHaveAccessibleDescription('6/40')
		})

		it('обновляет счётчик при изменении modelValue', async () => {
			const { rerender } = render(BaseTextarea, { props: { modelValue: '', maxlength: 10 } })
			expect(screen.getByText('0/10')).toBeInTheDocument()

			await rerender({ modelValue: 'Код 24', maxlength: 10 })

			expect(screen.getByText('6/10')).toBeInTheDocument()
		})

		it('с ошибкой описывает поле и ошибкой, и счётчиком', () => {
			render(BaseTextarea, { props: { modelValue: '', label: 'Отзыв', maxlength: 200, error: 'Напишите отзыв' } })

			expect(screen.getByLabelText('Отзыв')).toHaveAccessibleDescription('Напишите отзыв 0/200')
		})

		it('без maxlength счётчика нет', () => {
			const { container } = render(BaseTextarea, { props: { modelValue: 'Текст' } })

			expect(container.querySelector('.base-textarea__counter')).toBeNull()
			expect(container.firstElementChild).not.toHaveClass('base-textarea--has-counter')
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

		it('уменьшает высоту, когда текст удаляют: перед измерением сбрасывает высоту и учитывает рамки', async () => {
			let contentHeight = 30
			const { container, rerender } = render(BaseTextarea, {
				props: { modelValue: 'Строка', isAutosize: true },
			})
			const textarea = container.querySelector('textarea') as HTMLTextAreaElement
			textarea.style.border = '1px solid'
			emulateScrollHeight(textarea, () => contentHeight)

			contentHeight = 90
			await rerender({ modelValue: 'Строка\nСтрока\nСтрока' })
			await nextTick()
			expect(textarea.style.height).toBe('92px')

			contentHeight = 30
			await rerender({ modelValue: 'Строка' })
			await nextTick()
			expect(textarea.style.height).toBe('32px')
		})

		it('подгоняет высоту при включении isAutosize и сбрасывает её при выключении', async () => {
			const { container, rerender } = render(BaseTextarea, {
				props: { modelValue: 'Строка\nСтрока', isAutosize: false },
			})
			const textarea = container.querySelector('textarea') as HTMLTextAreaElement
			emulateScrollHeight(textarea, () => 50)

			await rerender({ isAutosize: true })
			await nextTick()
			expect(textarea.style.height).toBe('50px')

			await rerender({ isAutosize: false })
			expect(textarea.style.height).toBe('')
		})

		it('не должен падать когда adjustHeight вызван без DOM-элемента (el=null)', () => {
			const { container } = render(BaseTextarea, {
				props: { modelValue: '', isAutosize: true },
			})

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

			exposed!.textareaRef.value = null

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

describe('BaseTextarea: имя и атрибуты поля', () => {
	it('ariaLabel и inputAttrs попадают на нативный textarea; name из пропа или inputAttrs', async () => {
		const { rerender } = render(BaseTextarea, {
			props: { ariaLabel: 'Отзыв', inputAttrs: { id: 'review', name: 'review', 'data-testid': 'review-field' } },
		})

		const textarea = screen.getByRole('textbox', { name: 'Отзыв' })
		expect(textarea).toHaveAttribute('id', 'review')
		expect(textarea).toHaveAttribute('name', 'review')
		expect(textarea).toHaveAttribute('data-testid', 'review-field')

		await rerender({ name: 'comment' })
		expect(textarea).toHaveAttribute('name', 'comment')
	})
})

describe('BaseTextarea: expose', () => {
	it('focus и blur управляют фокусом поля', async () => {
		const exposedRef = ref<{ focus: () => void; blur: () => void } | null>(null)
		render(defineComponent({ setup: () => () => h(BaseTextarea, { modelValue: '', ref: exposedRef }) }))
		await nextTick()

		exposedRef.value!.focus()
		expect(screen.getByRole('textbox')).toHaveFocus()
		exposedRef.value!.blur()
		expect(screen.getByRole('textbox')).not.toHaveFocus()
	})

	it('input без textarea в target не меняет значение', () => {
		const { emitted } = render(BaseTextarea, { props: { modelValue: '' } })
		const event = new Event('input')
		Object.defineProperty(event, 'target', { value: null })

		screen.getByRole('textbox').dispatchEvent(event)

		expect(emitted()['update:modelValue']).toBeUndefined()
	})
})
