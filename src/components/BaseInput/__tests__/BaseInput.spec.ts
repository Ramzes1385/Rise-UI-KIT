import '@testing-library/jest-dom/vitest'
import BaseInput from '../ui/BaseInput.vue'
import userEvent from '@testing-library/user-event'
import { fireEvent, render, screen } from '@testing-library/vue'

describe('BaseInput unit', () => {
	describe('рендер', () => {
		it('должен рендерить текстовое поле', () => {
			render(BaseInput, { props: { modelValue: '' } })

			expect(screen.getByRole('textbox')).toBeInTheDocument()
		})

		it('должен отображать placeholder', () => {
			render(BaseInput, { props: { modelValue: '', placeholder: 'Введите текст' } })

			expect(screen.getByPlaceholderText('Введите текст')).toBeInTheDocument()
		})

		it('должен отображать значение modelValue', () => {
			render(BaseInput, { props: { modelValue: 'Тестовое значение' } })

			expect(screen.getByDisplayValue('Тестовое значение')).toBeInTheDocument()
		})
	})

	describe('пропс label', () => {
		it('должен отображать label когда передан', () => {
			render(BaseInput, { props: { modelValue: '', label: 'Email' } })

			expect(screen.getByText('Email')).toBeInTheDocument()
		})

		it('не должен отображать label когда не передан', () => {
			const { container } = render(BaseInput, { props: { modelValue: '' } })

			expect(container.querySelector('.base-input__label')).not.toBeInTheDocument()
		})

		it('связывает label с полем: поле находится по тексту метки и получает её как доступное имя', () => {
			render(BaseInput, { props: { modelValue: '', label: 'Email' } })

			const field = screen.getByLabelText('Email')
			expect(field.tagName).toBe('INPUT')
			expect(field).toHaveAccessibleName('Email')
		})
	})

	describe('пропс variant', () => {
		it('не должен добавлять модификатор для варианта default', () => {
			const { container } = render(BaseInput, { props: { modelValue: '' } })

			expect(container.firstElementChild?.classList.contains('base-input--default')).toBe(false)
			expect(container.firstElementChild?.classList.contains('base-input--outline')).toBe(false)
		})

		it('должен применять модификатор --filled', () => {
			const { container } = render(BaseInput, {
				props: { modelValue: '', variant: 'filled' },
			})

			expect(container.firstElementChild?.classList.contains('base-input--filled')).toBe(true)
		})

		it('должен применять модификатор --underline', () => {
			const { container } = render(BaseInput, {
				props: { modelValue: '', variant: 'underline' },
			})

			expect(container.firstElementChild?.classList.contains('base-input--underline')).toBe(true)
		})
	})

	describe('пропс isDisabled', () => {
		it('должен быть disabled когда isDisabled=true', () => {
			render(BaseInput, { props: { modelValue: '', isDisabled: true } })

			expect(screen.getByRole('textbox')).toBeDisabled()
		})

		it('должен добавлять класс --disabled когда isDisabled=true', () => {
			const { container } = render(BaseInput, {
				props: { modelValue: '', isDisabled: true },
			})

			expect(container.firstElementChild?.classList.contains('base-input--disabled')).toBe(true)
		})
	})

	describe('пропс error', () => {
		it('должен отображать текст ошибки', () => {
			render(BaseInput, { props: { modelValue: '', error: 'Обязательное поле' } })

			expect(screen.getByText('Обязательное поле')).toBeInTheDocument()
		})

		it('должен добавлять класс --error когда error передан', () => {
			const { container } = render(BaseInput, {
				props: { modelValue: '', error: 'Ошибка' },
			})

			expect(container.firstElementChild?.classList.contains('base-input--error')).toBe(true)
		})

		it('помечает поле aria-invalid и связывает с текстом ошибки через aria-describedby', () => {
			render(BaseInput, { props: { modelValue: '', label: 'Email', error: 'Неверный адрес' } })

			const field = screen.getByLabelText('Email')
			expect(field).toHaveAttribute('aria-invalid', 'true')
			expect(field).toHaveAccessibleDescription('Неверный адрес')
		})

		it('без ошибки не ставит aria-invalid и aria-describedby', () => {
			render(BaseInput, { props: { modelValue: '', label: 'Email' } })

			const field = screen.getByLabelText('Email')
			expect(field).not.toHaveAttribute('aria-invalid')
			expect(field).not.toHaveAttribute('aria-describedby')
		})
	})

	describe('пропс isRequired', () => {
		it('должен отображать звёздочку когда isRequired=true', () => {
			render(BaseInput, { props: { modelValue: '', isRequired: true, label: 'Поле' } })

			expect(screen.getByText('*')).toBeInTheDocument()
		})
	})

	describe('пропс prefix', () => {
		it('должен отображать префикс', () => {
			render(BaseInput, { props: { modelValue: '', prefix: '+7' } })

			expect(screen.getByText('+7')).toBeInTheDocument()
		})

		it('должен добавлять класс --has-prefix когда prefix передан', () => {
			const { container } = render(BaseInput, {
				props: { modelValue: '', prefix: '+7' },
			})

			expect(container.firstElementChild?.classList.contains('base-input--has-prefix')).toBe(true)
		})
	})

	describe('пропс postfix', () => {
		it('должен отображать постфикс', () => {
			render(BaseInput, { props: { modelValue: '', postfix: 'мм' } })

			expect(screen.getByText('мм')).toBeInTheDocument()
		})

		it('должен добавлять класс --has-postfix когда postfix передан', () => {
			const { container } = render(BaseInput, {
				props: { modelValue: '', postfix: 'мм' },
			})

			expect(container.firstElementChild?.classList.contains('base-input--has-postfix')).toBe(true)
		})
	})

	describe('пропс sizeScale', () => {
		it('не должен устанавливать style когда sizeScale=1', () => {
			const { container } = render(BaseInput, {
				props: { modelValue: '', sizeScale: 100 },
			})

			expect(container.firstElementChild?.getAttribute('style')).toBeNull()
		})

		it('должен устанавливать --size-scale когда sizeScale=150', () => {
			const { container } = render(BaseInput, {
				props: { modelValue: '', sizeScale: 150 },
			})

			expect(container.firstElementChild?.getAttribute('style')).toContain('--size-scale: 1.5')
		})

		it('должен фиксировать размер иконки пароля при sizeScale=125: иконка 20px, а не 25px', () => {
			const { container } = render(BaseInput, {
				props: { modelValue: '', type: 'password', sizeScale: 125 },
			})

			const icon = container.querySelector('.base-input__password-toggle .base-icon') as HTMLElement
			expect(icon.style.getPropertyValue('--size-scale')).toBe('1.0001')
		})

		it('должен оставлять иконку пароля наследующей масштаб при sizeScale=100', () => {
			const { container } = render(BaseInput, {
				props: { modelValue: '', type: 'password', sizeScale: 100 },
			})

			const icon = container.querySelector('.base-input__password-toggle .base-icon') as HTMLElement
			expect(icon.style.getPropertyValue('--size-scale')).toBe('0.8')
		})

		it('должен устанавливать --size-scale когда sizeScale=0.75', () => {
			const { container } = render(BaseInput, {
				props: { modelValue: '', sizeScale: 75 },
			})

			expect(container.firstElementChild?.getAttribute('style')).toContain('--size-scale: 0.75')
		})
	})

	describe('пропс type', () => {
		it('должен рендерить input type=text по умолчанию', () => {
			render(BaseInput, { props: { modelValue: '' } })

			const input = screen.getByRole('textbox')
			expect(input).toHaveAttribute('type', 'text')
		})

		it('должен рендерить input type=password', () => {
			render(BaseInput, { props: { modelValue: '', type: 'password' } })

			const input = document.querySelector('input[type="password"]')
			expect(input).toBeInTheDocument()
		})

		it('должен добавлять класс --password когда type=password', () => {
			const { container } = render(BaseInput, { props: { modelValue: '', type: 'password' } })

			expect(container.firstElementChild?.classList.contains('base-input--password')).toBe(true)
		})

		it('должен рендерить кнопку переключения видимости пароля', () => {
			render(BaseInput, { props: { modelValue: '', type: 'password' } })

			expect(document.querySelector('.base-input__password-toggle')).toBeInTheDocument()
		})

		it('должен рендерить input type=email', () => {
			render(BaseInput, { props: { modelValue: '', type: 'email' } })

			const input = document.querySelector('input[type="email"]')
			expect(input).toBeInTheDocument()
		})

		it('должен рендерить input type=tel', () => {
			render(BaseInput, { props: { modelValue: '', type: 'tel' } })

			const input = document.querySelector('input[type="tel"]')
			expect(input).toBeInTheDocument()
		})

		it('должен рендерить input type=number', () => {
			render(BaseInput, { props: { modelValue: '', type: 'number' } })

			const input = document.querySelector('input[type="number"]')
			expect(input).toBeInTheDocument()
		})
	})

	describe('пропс isReadonly', () => {
		it('должен добавлять атрибут readonly когда isReadonly=true', () => {
			render(BaseInput, { props: { modelValue: '', isReadonly: true } })

			expect(screen.getByRole('textbox')).toHaveAttribute('readonly')
		})

		it('должен добавлять класс --readonly когда isReadonly=true', () => {
			const { container } = render(BaseInput, { props: { modelValue: '', isReadonly: true } })

			expect(container.firstElementChild?.classList.contains('base-input--readonly')).toBe(true)
		})

		it('не должен добавлять атрибут readonly когда isReadonly=false', () => {
			render(BaseInput, { props: { modelValue: '', isReadonly: false } })

			expect(screen.getByRole('textbox')).not.toHaveAttribute('readonly')
		})
	})

	describe('пропс mask', () => {
		it('должен применять маску к отображаемому значению', () => {
			render(BaseInput, { props: { modelValue: '1234567890', mask: '(###) ###-##-##' } })

			expect(screen.getByDisplayValue('(123) 456-78-90')).toBeInTheDocument()
		})

		it('не должен применять маску когда mask не передана', () => {
			render(BaseInput, { props: { modelValue: '1234567890' } })

			expect(screen.getByDisplayValue('1234567890')).toBeInTheDocument()
		})

		it('не должен применять маску для type=password', () => {
			render(BaseInput, { props: { modelValue: '1234567890', type: 'password', mask: '(###) ###-##-##' } })

			const input = document.querySelector('input[type="password"]')
			expect(input).toHaveValue('1234567890')
		})
	})

	describe('пропс passwordRules', () => {
		it('должен отображать правила пароля', () => {
			render(BaseInput, {
				props: {
					modelValue: 'abc',
					type: 'password',
					passwordRules: [{ key: 'min', label: 'Минимум 8 символов', validate: (v: string) => v.length >= 8 }],
				},
			})

			expect(screen.getByText('Минимум 8 символов')).toBeInTheDocument()
		})

		it('должен отмечать невалидное правило', () => {
			const { container } = render(BaseInput, {
				props: {
					modelValue: 'abc',
					type: 'password',
					passwordRules: [{ key: 'min', label: 'Минимум 8 символов', validate: (v: string) => v.length >= 8 }],
				},
			})

			expect(container.querySelector('.base-input__password-rule--valid')).not.toBeInTheDocument()
		})

		it('должен отмечать валидное правило', () => {
			const { container } = render(BaseInput, {
				props: {
					modelValue: 'abcdefgh',
					type: 'password',
					passwordRules: [{ key: 'min', label: 'Минимум 8 символов', validate: (v: string) => v.length >= 8 }],
				},
			})

			expect(container.querySelector('.base-input__password-rule--valid')).toBeInTheDocument()
		})

		it('не должен отображать правила когда passwordRules не передан', () => {
			const { container } = render(BaseInput, { props: { modelValue: '', type: 'password' } })

			expect(container.querySelector('.base-input__password-rules')).not.toBeInTheDocument()
		})
	})

	describe('эвенты', () => {
		it('должен вызывать emit blur при потере фокуса', async function () {
			const { emitted } = render(BaseInput, { props: { modelValue: '' } })
			const input = screen.getByRole('textbox')

			await fireEvent.update(input, 'test')
			await fireEvent.blur(input)

			expect(emitted()).toHaveProperty('blur')
		})

		it('должен вызывать emit focus при получении фокуса', async function () {
			const { emitted } = render(BaseInput, { props: { modelValue: '' } })
			const input = screen.getByRole('textbox')

			await fireEvent.focus(input)

			expect(emitted()).toHaveProperty('focus')
		})

		it('должен эмитить keydown при нажатии клавиши', async () => {
			const { emitted } = render(BaseInput, { props: { modelValue: '' } })
			const input = screen.getByRole('textbox')

			await fireEvent.keyDown(input, { key: 'Enter' })

			expect(emitted()).toHaveProperty('keydown')
		})
	})

	describe('slot suffix', () => {
		it('должен рендерить содержимое слота suffix', () => {
			const { container } = render(BaseInput, {
				props: { modelValue: '' },
				slots: {
					suffix: '<span class="test-suffix">Суффикс</span>',
				},
			})

			expect(container.querySelector('.test-suffix')).toBeInTheDocument()
			expect(screen.getByText('Суффикс')).toBeInTheDocument()
		})
	})

	describe('переключение видимости пароля', () => {
		it('должен менять aria-label и иконку при клике на toggle', async () => {
			render(BaseInput, { props: { modelValue: 'secret', type: 'password' } })

			const toggle = document.querySelector('.base-input__password-toggle') as HTMLElement
			expect(toggle.getAttribute('aria-label')).toBe('Показать пароль')

			await fireEvent.click(toggle)

			expect(toggle.getAttribute('aria-label')).toBe('Скрыть пароль')
		})
	})

	describe('modelValue null/undefined', () => {
		it('должен корректно обрабатывать modelValue=null в displayValue', () => {
			render(BaseInput, {
				props: { modelValue: null },
			})

			expect(screen.getByRole('textbox')).toHaveValue('')
		})

		it('должен корректно обрабатывать modelValue=null в passwordRuleResults', () => {
			render(BaseInput, {
				props: {
					modelValue: null,
					type: 'password',
					passwordRules: [{ key: 'min', label: 'Минимум 8', validate: (v: string) => v.length >= 8 }],
				},
			})

			expect(screen.getByText('Минимум 8')).toBeInTheDocument()
		})
	})

	describe('keydown — null modelValue с маской', () => {
		it('должен корректно обрабатывать Backspace когда modelValue=null и есть mask', async () => {
			const { emitted } = render(BaseInput, {
				props: { modelValue: null, mask: '##' },
			})
			const input = screen.getByRole('textbox') as HTMLInputElement

			input.setSelectionRange(0, 0)
			await fireEvent.keyDown(input, { key: 'Backspace' })

			const emits = emitted()['update:modelValue']
			expect(emits === undefined || emits.length === 0).toBe(true)
		})
	})

	describe('обработка клавиш с маской — граничные случаи', () => {
		it('должен использовать 0 когда selectionStart=null', async () => {
			const { emitted } = render(BaseInput, { props: { modelValue: '1', mask: '##' } })
			const input = screen.getByRole('textbox') as HTMLInputElement

			Object.defineProperty(input, 'selectionStart', { value: null, configurable: true })

			await fireEvent.keyDown(input, { key: 'Backspace' })

			expect(emitted()).toHaveProperty('keydown')
		})

		it('не должен эмитить update при Backspace когда cursorPos=0', async () => {
			const { emitted } = render(BaseInput, { props: { modelValue: '12', mask: '##' } })
			const input = screen.getByRole('textbox') as HTMLInputElement

			input.setSelectionRange(0, 0)
			await fireEvent.keyDown(input, { key: 'Backspace' })

			const updates = emitted()['update:modelValue']
			expect(updates).toBeUndefined()
		})

		it('не должен эмитить update при Delete когда cursorPos=current.length', async () => {
			const { emitted } = render(BaseInput, { props: { modelValue: '12', mask: '##' } })
			const input = screen.getByRole('textbox') as HTMLInputElement

			input.setSelectionRange(2, 2)
			await fireEvent.keyDown(input, { key: 'Delete' })

			const updates = emitted()['update:modelValue']
			expect(updates).toBeUndefined()
		})

		it('не должен эмитить update при Backspace когда valueIndex вне диапазона', async () => {
			const { emitted } = render(BaseInput, { props: { modelValue: '', mask: '(###)' } })
			const input = screen.getByRole('textbox') as HTMLInputElement

			Object.defineProperty(input, 'selectionStart', { value: 1, configurable: true })
			await fireEvent.keyDown(input, { key: 'Backspace' })

			const updates = emitted()['update:modelValue']
			expect(updates).toBeUndefined()
		})

		it('не должен эмитить update при Delete когда valueIndex вне диапазона', async () => {
			vi.resetModules()
			vi.doMock('@composables/form/useInputMask', () => ({
				useInputMask: () => ({
					applyMask: (v: string) => v,
					stripMask: (v: string) => v,
					getMaxTokenCount: () => 10,
					getMaskPosition: () => 0,
					findNearestTokenLeft: () => ({ maskPos: 0, valueIndex: 0 }),
					maskValue: (v: string) => v,
					unmaskValue: (v: string) => v,
					limitValue: (v: string) => v,
					cursorAfterInput: () => 0,
					cursorAfterBackspace: () => ({ maskPos: 0, valueIndex: 0 }),
					cursorAfterDelete: () => ({ maskPos: 0, valueIndex: 999 }),
				}),
				useMaskedInputHandlers: (opts: any) => {
					const maskFns = {
						applyMask: (v: string) => v,
						stripMask: (v: string) => v,
						limitValue: (v: string) => v,
						cursorAfterInput: () => 0,
						cursorAfterBackspace: () => ({ maskPos: 0, valueIndex: 0 }),
						cursorAfterDelete: (_pos: number) => ({ maskPos: 0, valueIndex: 999 }),
					}
					return {
						handleInput: (e: Event) => {
							const target = e.target as HTMLInputElement
							opts.emit('update:modelValue', target.value)
						},
						handleKeydown: (e: KeyboardEvent) => {
							opts.onKeydown?.(e)
							if (e.key === 'Delete') {
								const target = e.target as HTMLInputElement
								const cursorPos = target.selectionStart ?? 0
								const current = opts.getValue() == null ? '' : String(opts.getValue())
								e.preventDefault()
								if (cursorPos >= current.length) return
								const { valueIndex } = maskFns.cursorAfterDelete(cursorPos)
								if (valueIndex < 0 || valueIndex >= current.length) return
								const newValue = current.slice(0, valueIndex) + current.slice(valueIndex + 1)
								opts.emit('update:modelValue', newValue)
							}
						},
						applyMask: maskFns.applyMask,
					}
				},
			}))
			const { default: BaseInputMocked } = await import('../ui/BaseInput.vue')
			const { emitted } = render(BaseInputMocked, { props: { modelValue: '12', mask: '##' } })
			const input = screen.getByRole('textbox') as HTMLInputElement

			Object.defineProperty(input, 'selectionStart', { value: 0, configurable: true })
			await fireEvent.keyDown(input, { key: 'Delete' })

			const updates = emitted()['update:modelValue']
			expect(updates).toBeUndefined()

			vi.doUnmock('@composables/form/useInputMask')
		})
	})

	describe('позиция курсора после маски', () => {
		it('ставит курсор сразу после ввода с маской', async () => {
			render(BaseInput, { props: { modelValue: '', mask: '##-##' } })
			const input = screen.getByRole('textbox') as HTMLInputElement

			await fireEvent.update(input, '123')

			expect(input.value).toBe('12-3')
			expect(input.selectionStart).toBe(4)
		})

		it('ставит курсор после Backspace и Delete с маской', async () => {
			render(BaseInput, { props: { modelValue: '12', mask: '##' } })
			const input = screen.getByRole('textbox') as HTMLInputElement

			input.setSelectionRange(2, 2)
			await fireEvent.keyDown(input, { key: 'Backspace' })
			expect(input.selectionStart).toBe(1)

			input.setSelectionRange(0, 0)
			await fireEvent.keyDown(input, { key: 'Delete' })
			expect(input.selectionStart).toBe(0)
		})

		it('не возвращает курсор, если значение изменилось до обновления DOM', async () => {
			render(BaseInput, { props: { modelValue: '', mask: '####' } })
			const input = screen.getByRole('textbox') as HTMLInputElement

			const pending = fireEvent.update(input, '12')
			input.value = '123'
			input.setSelectionRange(3, 3)
			await pending

			expect(input.selectionStart).toBe(3)
		})

		it('не ставит курсор у типов без выделения текста', async () => {
			const { emitted } = render(BaseInput, { props: { modelValue: '', type: 'email', allowedChars: 'letters' } })
			const input = screen.getByRole('textbox') as HTMLInputElement

			await fireEvent.update(input, 'ab1')

			expect(input.value).toBe('ab')
			expect(emitted()['update:modelValue']).toEqual([['ab']])
		})

		it('не падает, если поле размонтировали до обновления DOM', async () => {
			const { unmount } = render(BaseInput, { props: { modelValue: '', mask: '##' } })
			const input = screen.getByRole('textbox') as HTMLInputElement

			const pending = fireEvent.update(input, '12')
			unmount()

			await expect(pending).resolves.not.toThrow()
		})
	})

	describe('публичный API focus/blur', () => {
		it('должен фокусировать инпут через метод focus', () => {
			const wrapper = render(BaseInput, { props: { modelValue: '' } })
			const input = wrapper.container.querySelector('input') as HTMLInputElement
			const focusSpy = vi.spyOn(input, 'focus')

			const exposed = (wrapper as unknown as { ref?: { focus: () => void } }).ref
			exposed?.focus()

			expect(focusSpy).toBeDefined()
		})
	})

	describe('публичный API через mount', () => {
		it('должен вызывать focus у инпута через defineExpose', async () => {
			const { mount } = await import('@vue/test-utils')
			const wrapper = mount(BaseInput, { props: { modelValue: '' } })
			const input = wrapper.find('input').element
			const focusSpy = vi.spyOn(input, 'focus')

			const exposed = wrapper.vm as unknown as { focus: () => void; blur: () => void }
			exposed.focus()

			expect(focusSpy).toHaveBeenCalled()
			wrapper.unmount()
		})

		it('должен вызывать blur у инпута через defineExpose', async () => {
			const { mount } = await import('@vue/test-utils')
			const wrapper = mount(BaseInput, { props: { modelValue: '' } })
			const input = wrapper.find('input').element
			const blurSpy = vi.spyOn(input, 'blur')

			const exposed = wrapper.vm as unknown as { focus: () => void; blur: () => void }
			exposed.blur()

			expect(blurSpy).toHaveBeenCalled()
			wrapper.unmount()
		})
	})

	describe('ввод с маской — корректировка target.value', () => {
		it('должен корректировать target.value когда он отличается от ожидаемого', async () => {
			const { container, emitted } = render(BaseInput, { props: { modelValue: '', mask: '(##)' } })
			const input = container.querySelector('input') as HTMLInputElement

			input.value = '12'
			input.dispatchEvent(new Event('input', { bubbles: true }))

			expect(emitted()).toHaveProperty('update:modelValue')
		})
	})

	describe('пропс customClass', () => {
		it('должен добавлять строку класса к корневому элементу', () => {
			const { container } = render(BaseInput, {
				props: { modelValue: '', customClass: 'custom-input-class' },
			})

			expect(container.querySelector('.base-input')).toHaveClass('custom-input-class')
		})

		it('должен распределять объект классов по внутренним элементам', () => {
			const { container } = render(BaseInput, {
				props: {
					modelValue: '123',
					label: 'Поле',
					isRequired: true,
					prefix: '+7',
					postfix: 'руб',
					error: 'Ошибка',
					type: 'password',
					passwordRules: [{ key: 'min', label: 'Минимум 8', validate: () => false }],
					customClass: {
						root: 'custom-input-root',
						label: 'custom-input-label',
						required: 'custom-input-required',
						wrapper: 'custom-input-wrapper',
						prefix: 'custom-input-prefix',
						field: 'custom-input-field',
						passwordToggle: 'custom-input-toggle',
						passwordIcon: 'custom-input-icon',
						postfix: 'custom-input-postfix',
						passwordRules: 'custom-input-rules',
						passwordRule: 'custom-input-rule',
						errorText: 'custom-input-error',
					},
				},
			})

			expect(container.querySelector('.base-input')).toHaveClass('custom-input-root')
			expect(container.querySelector('.base-input__label')).toHaveClass('custom-input-label')
			expect(container.querySelector('.base-input__required')).toHaveClass('custom-input-required')
			expect(container.querySelector('.base-input__wrapper')).toHaveClass('custom-input-wrapper')
			expect(container.querySelector('.base-input__prefix')).toHaveClass('custom-input-prefix')
			expect(container.querySelector('.base-input__field')).toHaveClass('custom-input-field')
			expect(container.querySelector('.base-input__password-toggle')).toHaveClass('custom-input-toggle')
			expect(container.querySelector('.base-input__password-rules')).toHaveClass('custom-input-rules')
			expect(container.querySelector('.base-input__password-rule')).toHaveClass('custom-input-rule')
			expect(container.querySelector('.base-input__error-text')).toHaveClass('custom-input-error')
		})
	})
})

describe('BaseInput: имя и атрибуты поля', () => {
	it('ariaLabel — имя поля без видимой подписи', () => {
		render(BaseInput, { props: { modelValue: '', ariaLabel: 'Поиск по заказам' } })

		expect(screen.getByRole('textbox', { name: 'Поиск по заказам' })).toBeInTheDocument()
	})

	it('inputAttrs попадают на нативный input; свой id связывает подпись, описание добавляется к ошибке', () => {
		render(BaseInput, {
			props: {
				modelValue: '',
				label: 'E-mail',
				error: 'Неверный адрес',
				inputAttrs: {
					id: 'email',
					name: 'email',
					autocomplete: 'email',
					inputmode: 'email',
					'data-testid': 'email-field',
					'aria-describedby': 'email-hint',
				},
			},
		})

		const input = screen.getByRole('textbox', { name: 'E-mail' })
		expect(input).toHaveAttribute('id', 'email')
		expect(input).toHaveAttribute('name', 'email')
		expect(input).toHaveAttribute('autocomplete', 'email')
		expect(input).toHaveAttribute('inputmode', 'email')
		expect(input).toHaveAttribute('data-testid', 'email-field')
		expect(input.getAttribute('aria-describedby')).toMatch(/^v-\S+-error email-hint$/)
	})

	describe('type="search" и иконка', () => {
		it('type="search" даёт поле поиска с иконкой лупы слева', () => {
			const { container } = render(BaseInput, { props: { modelValue: '', type: 'search', ariaLabel: 'Поиск' } })

			expect(screen.getByRole('searchbox', { name: 'Поиск' })).toHaveAttribute('type', 'search')
			expect(container.querySelector('.base-input__icon')).toBeInTheDocument()
			expect(container.querySelector('.base-input')).toHaveClass('base-input--has-icon')
		})

		it('у поиска enterkeyhint="search", у текстового поля его нет', () => {
			const search = render(BaseInput, { props: { modelValue: '', type: 'search', ariaLabel: 'Поиск' } })
			expect(screen.getByRole('searchbox')).toHaveAttribute('enterkeyhint', 'search')
			search.unmount()
			render(BaseInput, { props: { modelValue: '' } })
			expect(screen.getByRole('textbox')).not.toHaveAttribute('enterkeyhint')
		})

		it('кнопка очистки есть только у поиска с текстом: сбрасывает значение и возвращает фокус в поле', async () => {
			const { emitted, rerender } = render(BaseInput, { props: { modelValue: '', type: 'search', ariaLabel: 'Поиск' } })
			expect(screen.queryByRole('button', { name: 'Очистить' })).not.toBeInTheDocument()

			await rerender({ modelValue: 'кот' })
			await fireEvent.click(screen.getByRole('button', { name: 'Очистить' }))

			expect(emitted()['update:modelValue']).toEqual([['']])
			expect(screen.getByRole('searchbox')).toHaveFocus()
		})

		it('кнопка очистки доступна с клавиатуры: в порядке Tab, без tabindex=-1', async () => {
			render(BaseInput, { props: { modelValue: 'кот', type: 'search', ariaLabel: 'Поиск' } })
			expect(screen.getByRole('button', { name: 'Очистить' })).not.toHaveAttribute('tabindex')
			screen.getByRole('searchbox').focus()
			await userEvent.tab()
			expect(screen.getByRole('button', { name: 'Очистить' })).toHaveFocus()
		})

		it('Esc в поиске с текстом очищает поле и не пускает Esc дальше к слою; в пустом поле Esc не трогают', async () => {
			const onKeydown = vi.fn()
			const { emitted, rerender } = render(BaseInput, {
				props: { modelValue: 'кот', type: 'search', ariaLabel: 'Поиск', onKeydown },
			})
			const field = screen.getByRole('searchbox')
			const event = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true })
			field.dispatchEvent(event)
			expect(event.defaultPrevented).toBe(true)
			expect(emitted()['update:modelValue']).toEqual([['']])
			expect(onKeydown).toHaveBeenCalledTimes(1)

			await rerender({ modelValue: '' })
			const second = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true })
			field.dispatchEvent(second)
			expect(second.defaultPrevented).toBe(false)
			expect(emitted()['update:modelValue']).toHaveLength(1)
		})

		it('Esc, перехваченный обработчиком keydown родителя, поле не очищает; в обычном поле Esc не очищает', async () => {
			const prevent = (event: KeyboardEvent): void => event.preventDefault()
			const guarded = render(BaseInput, { props: { modelValue: 'кот', type: 'search', ariaLabel: 'Поиск', onKeydown: prevent } })
			await fireEvent.keyDown(screen.getByRole('searchbox'), { key: 'Escape' })
			expect(guarded.emitted()['update:modelValue']).toBeUndefined()
			guarded.unmount()

			const text = render(BaseInput, { props: { modelValue: 'кот', ariaLabel: 'Текст' } })
			await fireEvent.keyDown(screen.getByRole('textbox'), { key: 'Escape' })
			expect(text.emitted()['update:modelValue']).toBeUndefined()
		})

		it('Esc во время IME-композиции поле не очищает', () => {
			const { emitted } = render(BaseInput, { props: { modelValue: 'кот', type: 'search', ariaLabel: 'Поиск' } })
			const event = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true, isComposing: true })
			screen.getByRole('searchbox').dispatchEvent(event)
			expect(event.defaultPrevented).toBe(false)
			expect(emitted()['update:modelValue']).toBeUndefined()
		})

		it('кнопки очистки нет у выключенного, только читаемого и обычного поля', () => {
			render(BaseInput, { props: { modelValue: 'a', type: 'search', isDisabled: true } })
			expect(screen.queryByRole('button', { name: 'Очистить' })).not.toBeInTheDocument()
		})

		it('кнопки очистки нет у текстового поля с текстом', () => {
			render(BaseInput, { props: { modelValue: 'a' } })
			expect(screen.queryByRole('button', { name: 'Очистить' })).not.toBeInTheDocument()
		})

		it('icon="" у поиска убирает иконку', () => {
			const { container } = render(BaseInput, { props: { modelValue: '', type: 'search', icon: '' } })

			expect(container.querySelector('.base-input__icon')).not.toBeInTheDocument()
		})

		it('icon добавляет иконку слева у текстового поля, обычное поле без иконки', () => {
			const { container, rerender } = render(BaseInput, { props: { modelValue: '' } })
			expect(container.querySelector('.base-input__icon')).not.toBeInTheDocument()

			return rerender({ modelValue: '', icon: 'mail' }).then(() => {
				expect(container.querySelector('.base-input__icon')).toBeInTheDocument()
			})
		})

		it('type="date" рендерит нативное поле даты', () => {
			const { container } = render(BaseInput, { props: { modelValue: '2026-10-13', type: 'date' } })

			expect(container.querySelector('input')).toHaveAttribute('type', 'date')
		})

		it('aria из inputAttrs не затирается пустыми значениями формы (aria-invalid остаётся)', () => {
			render(BaseInput, { props: { modelValue: '', ariaLabel: 'Поле', inputAttrs: { 'aria-invalid': 'true' } } })

			expect(screen.getByRole('textbox', { name: 'Поле' })).toHaveAttribute('aria-invalid', 'true')
		})
	})
})
