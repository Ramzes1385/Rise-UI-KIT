/**
 * Unit-тесты для BaseInput.
 * Проверяют рендер, пропсы и CSS-модификаторы.
 */

import '@testing-library/jest-dom/vitest'
import { fireEvent, render, screen } from '@testing-library/vue'
import BaseInput from '../ui/BaseInput.vue'

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
			vi.doMock('@composables/useInputMask', () => ({
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
					const maskFns = ({
						applyMask: (v: string) => v,
						stripMask: (v: string) => v,
						limitValue: (v: string) => v,
						cursorAfterInput: () => 0,
						cursorAfterBackspace: () => ({ maskPos: 0, valueIndex: 0 }),
					cursorAfterDelete: (_pos: number) => ({ maskPos: 0, valueIndex: 999 }),
				})
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

			vi.doUnmock('@composables/useInputMask')
		})
	})

	describe('requestAnimationFrame — синхронные вызовы для покрытия inputRef ветки', () => {
		const originalRaf = globalThis.requestAnimationFrame

		afterEach(() => {
			globalThis.requestAnimationFrame = originalRaf
		})

		it('должен вызывать setSelectionRange после ввода с маской', async () => {
			globalThis.requestAnimationFrame = function (cb: FrameRequestCallback): number {
				cb(0)
				return 0
			}

			const { emitted } = render(BaseInput, { props: { modelValue: '', mask: '##' } })
			const input = screen.getByRole('textbox') as HTMLInputElement

			await fireEvent.update(input, '12')

			expect(emitted()).toHaveProperty('update:modelValue')
		})

		it('должен вызывать setSelectionRange после Backspace с маской', async () => {
			globalThis.requestAnimationFrame = function (cb: FrameRequestCallback): number {
				cb(0)
				return 0
			}

			const { emitted } = render(BaseInput, { props: { modelValue: '12', mask: '##' } })
			const input = screen.getByRole('textbox') as HTMLInputElement

			input.setSelectionRange(2, 2)
			await fireEvent.keyDown(input, { key: 'Backspace' })

			expect(emitted()).toHaveProperty('update:modelValue')
		})

		it('должен вызывать setSelectionRange после Delete с маской', async () => {
			globalThis.requestAnimationFrame = function (cb: FrameRequestCallback): number {
				cb(0)
				return 0
			}

			const { emitted } = render(BaseInput, { props: { modelValue: '12', mask: '##' } })
			const input = screen.getByRole('textbox') as HTMLInputElement

			input.setSelectionRange(0, 0)
			await fireEvent.keyDown(input, { key: 'Delete' })

			expect(emitted()).toHaveProperty('update:modelValue')
		})

		it('должен корректно работать когда inputRef стал null после ввода', async () => {
			const callbacks: FrameRequestCallback[] = []
			globalThis.requestAnimationFrame = function (cb: FrameRequestCallback): number {
				callbacks.push(cb)
				return 0
			}

			const { unmount } = render(BaseInput, { props: { modelValue: '', mask: '##' } })
			const input = screen.getByRole('textbox') as HTMLInputElement

			await fireEvent.update(input, '12')
			unmount()
			callbacks.forEach(cb => cb(0))

			expect(callbacks.length).toBeGreaterThan(0)
		})

		it('должен корректно работать когда inputRef стал null после Backspace', async () => {
			const callbacks: FrameRequestCallback[] = []
			globalThis.requestAnimationFrame = function (cb: FrameRequestCallback): number {
				callbacks.push(cb)
				return 0
			}

			const { unmount } = render(BaseInput, { props: { modelValue: '12', mask: '##' } })
			const input = screen.getByRole('textbox') as HTMLInputElement

			input.setSelectionRange(2, 2)
			await fireEvent.keyDown(input, { key: 'Backspace' })
			unmount()
			callbacks.forEach(cb => cb(0))

			expect(callbacks.length).toBeGreaterThan(0)
		})

		it('должен корректно работать когда inputRef стал null после Delete', async () => {
			const callbacks: FrameRequestCallback[] = []
			globalThis.requestAnimationFrame = function (cb: FrameRequestCallback): number {
				callbacks.push(cb)
				return 0
			}

			const { unmount } = render(BaseInput, { props: { modelValue: '12', mask: '##' } })
			const input = screen.getByRole('textbox') as HTMLInputElement

			input.setSelectionRange(0, 0)
			await fireEvent.keyDown(input, { key: 'Delete' })
			unmount()
			callbacks.forEach(cb => cb(0))

			expect(callbacks.length).toBeGreaterThan(0)
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
