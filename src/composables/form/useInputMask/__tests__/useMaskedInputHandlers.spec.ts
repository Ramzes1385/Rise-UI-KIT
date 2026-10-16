import { nextTick, ref } from 'vue'
import { describe, it, expect, vi } from 'vitest'
import { useMaskedInputHandlers } from '../useMaskedInputHandlers'

function createInput(value = ''): HTMLInputElement {
	const input = document.createElement('input')
	input.value = value
	return input
}

function createOptions(overrides: Record<string, unknown> = {}) {
	const inputRef = ref<HTMLInputElement | null>(null)
	const emitted: Array<{ event: string; value: unknown }> = []
	const keydownEvents: KeyboardEvent[] = []

	return {
		inputRef,
		emitted,
		keydownEvents,
		opts: {
			getMask: () => (overrides.mask as string) ?? '###-###',
			getValue: () => (overrides.value as string | number | null) ?? '',
			isPassword: () => (overrides.isPassword as boolean) ?? false,
			emit: (event: string, value: string) => {
				emitted.push({ event, value })
			},
			onKeydown: (e: KeyboardEvent) => {
				keydownEvents.push(e)
			},
			inputRef,
		},
	}
}

describe('useMaskedInputHandlers', () => {
	describe('handleInput', () => {
		it('эмитит update:modelValue с raw значением когда нет маски', () => {
			const { opts, emitted } = createOptions({ mask: '' })
			const handlers = useMaskedInputHandlers(opts)
			const input = createInput('hello')

			handlers.handleInput({ target: input } as unknown as Event)
			expect(emitted).toEqual([{ event: 'update:modelValue', value: 'hello' }])
		})

		it('эмитит update:modelValue с raw значением для password', () => {
			const { opts, emitted } = createOptions({ mask: '###', isPassword: true })
			const handlers = useMaskedInputHandlers(opts)
			const input = createInput('abc')

			handlers.handleInput({ target: input } as unknown as Event)
			expect(emitted).toEqual([{ event: 'update:modelValue', value: 'abc' }])
		})

		it.each([
			['digits', 'a1b2-3', '123'],
			['digits', '１２ａ３', '123'],
			['letters', 'Ab1 вГ-2', 'AbвГ'],
			['alphanumeric', 'a1 б2-!', 'a1б2'],
		] as const)('allowedChars=%s отбрасывает недопустимые символы в поле и в модели', (filter, typed, expected) => {
			const { opts, emitted } = createOptions({ mask: '' })
			const handlers = useMaskedInputHandlers({ ...opts, getAllowedChars: () => filter })
			const input = createInput(typed)

			handlers.handleInput({ target: input } as unknown as Event)
			expect(input.value).toBe(expected)
			expect(emitted).toEqual([{ event: 'update:modelValue', value: expected }])
		})

		it('без allowedChars значение не фильтруется', () => {
			const { opts, emitted } = createOptions({ mask: '' })
			const handlers = useMaskedInputHandlers({ ...opts, getAllowedChars: () => undefined })

			handlers.handleInput({ target: createInput('a1 !') } as unknown as Event)
			expect(emitted).toEqual([{ event: 'update:modelValue', value: 'a1 !' }])
		})

		it('не обрабатывает не-HTMLInputElement target', () => {
			const { opts, emitted } = createOptions()
			const handlers = useMaskedInputHandlers(opts)

			handlers.handleInput({ target: document.createElement('div') } as unknown as Event)
			expect(emitted).toEqual([])
		})
	})

	describe('handleKeydown', () => {
		it('вызывает onKeydown колбэк', () => {
			const { opts, keydownEvents } = createOptions({ mask: '' })
			const handlers = useMaskedInputHandlers(opts)
			const event = new KeyboardEvent('keydown', { key: 'a' })

			handlers.handleKeydown(event)
			expect(keydownEvents).toEqual([event])
		})

		it('не обрабатывает клавиши когда нет маски', () => {
			const { opts, emitted } = createOptions({ mask: '' })
			const handlers = useMaskedInputHandlers(opts)
			const input = createInput('abc')
			Object.defineProperty(input, 'selectionStart', { value: 1 })

			const event = new KeyboardEvent('keydown', { key: 'Backspace' })
			Object.defineProperty(event, 'target', { value: input })
			Object.defineProperty(event, 'preventDefault', { value: vi.fn() })

			handlers.handleKeydown(event)
			expect(emitted).toEqual([])
		})

		it('не обрабатывает клавиши для password', () => {
			const { opts, emitted } = createOptions({ mask: '###', isPassword: true })
			const handlers = useMaskedInputHandlers(opts)
			const input = createInput('abc')
			Object.defineProperty(input, 'selectionStart', { value: 1 })

			const event = new KeyboardEvent('keydown', { key: 'Backspace' })
			Object.defineProperty(event, 'target', { value: input })

			handlers.handleKeydown(event)
			expect(emitted).toEqual([])
		})
	})

	describe('isReadonly (readonly/disabled поле)', () => {
		it('Backspace не меняет значение, не отменяет нативное поведение и пробрасывает keydown', () => {
			const { opts, emitted, keydownEvents } = createOptions({ mask: '###-###', value: '123456' })
			const handlers = useMaskedInputHandlers({ ...opts, isReadonly: () => true })
			const input = createInput('123-456')
			Object.defineProperty(input, 'selectionStart', { value: 7 })

			const event = new KeyboardEvent('keydown', { key: 'Backspace', cancelable: true })
			Object.defineProperty(event, 'target', { value: input })

			handlers.handleKeydown(event)
			expect(emitted).toEqual([])
			expect(event.defaultPrevented).toBe(false)
			expect(keydownEvents).toEqual([event])
		})

		it('Delete не меняет значение', () => {
			const { opts, emitted } = createOptions({ mask: '###-###', value: '123456' })
			const handlers = useMaskedInputHandlers({ ...opts, isReadonly: () => true })
			const input = createInput('123-456')
			Object.defineProperty(input, 'selectionStart', { value: 0 })

			const event = new KeyboardEvent('keydown', { key: 'Delete', cancelable: true })
			Object.defineProperty(event, 'target', { value: input })

			handlers.handleKeydown(event)
			expect(emitted).toEqual([])
			expect(event.defaultPrevented).toBe(false)
		})

		it('input-событие не эмитит значение и возвращает в поле отображение текущей модели', () => {
			const { opts, emitted } = createOptions({ mask: '###-###', value: '123456' })
			const handlers = useMaskedInputHandlers({ ...opts, isReadonly: () => true })
			const input = createInput('99')

			handlers.handleInput({ target: input } as unknown as Event)
			expect(emitted).toEqual([])
			expect(input.value).toBe('123-456')
		})

		it('без маски input-событие тоже не эмитит значение и восстанавливает исходный текст', () => {
			const { opts, emitted } = createOptions({ mask: '', value: 'abc' })
			const handlers = useMaskedInputHandlers({ ...opts, isReadonly: () => true })
			const input = createInput('abcd')

			handlers.handleInput({ target: input } as unknown as Event)
			expect(emitted).toEqual([])
			expect(input.value).toBe('abc')
		})
	})

	describe('applyMask', () => {
		it('применяет маску к значению', () => {
			const { opts } = createOptions({ mask: '###-###' })
			const handlers = useMaskedInputHandlers(opts)

			const result = handlers.applyMask('123456', '###-###')
			expect(result).toBe('123-456')
		})
	})
})

describe('useMaskedInputHandlers — ввод в поле', () => {
	interface FieldOptions {
		mask?: string
		value?: string | number | null
		allowedChars?: 'digits' | 'letters' | 'alphanumeric'
		type?: string
		isReadonly?: boolean
		withInputRef?: boolean
	}

	function setupField(config: FieldOptions = {}) {
		const input = document.createElement('input')
		input.type = config.type ?? 'text'
		document.body.appendChild(input)
		const model = ref<string | number | null>(config.value === undefined ? '' : config.value)
		const emit = vi.fn((_event: 'update:modelValue', value: string) => {
			model.value = value
		})
		const handlers = useMaskedInputHandlers({
			getMask: () => config.mask ?? '',
			getAllowedChars: () => config.allowedChars,
			getValue: () => model.value,
			isPassword: () => false,
			isReadonly: () => config.isReadonly ?? false,
			emit,
			inputRef: ref(config.withInputRef === false ? null : input),
		})
		return { input, handlers, emit, model }
	}

	function type(input: HTMLInputElement, value: string, cursor = value.length): Event {
		input.value = value
		if (input.selectionStart !== null) input.setSelectionRange(cursor, cursor)
		const event = new Event('input')
		Object.defineProperty(event, 'target', { value: input })
		return event
	}

	function key(input: HTMLInputElement, name: string, cursor: number): KeyboardEvent {
		input.setSelectionRange(cursor, cursor)
		const event = new KeyboardEvent('keydown', { key: name, cancelable: true })
		Object.defineProperty(event, 'target', { value: input })
		return event
	}

	afterEach(() => {
		document.body.innerHTML = ''
	})

	describe('с маской', () => {
		it('эмитит чистое значение, показывает его по маске и ставит курсор за введённым', async () => {
			const { input, handlers, emit } = setupField({ mask: '###-###' })
			handlers.handleInput(type(input, '1234'))

			expect(emit).toHaveBeenCalledWith('update:modelValue', '1234')
			expect(input.value).toBe('123-4')
			expect(input.selectionStart).toBe(5)
			await nextTick()
			expect(input.selectionStart).toBe(5)
		})

		it('обрезает ввод сверх маски', () => {
			const { input, handlers, emit } = setupField({ mask: '##-##' })
			handlers.handleInput(type(input, '12-345'))
			expect(emit).toHaveBeenCalledWith('update:modelValue', '1234')
			expect(input.value).toBe('12-34')
		})

		it('уже отформатированное значение поля не переписывает', () => {
			const { input, handlers } = setupField({ mask: '##-##' })
			const event = type(input, '12-3')
			const setter = vi.spyOn(input, 'value', 'set')
			handlers.handleInput(event)
			expect(setter).not.toHaveBeenCalled()
		})

		it('не возвращает курсор, если до следующей отрисовки значение поля изменилось', async () => {
			const { input, handlers } = setupField({ mask: '###-###' })
			handlers.handleInput(type(input, '1234'))
			input.value = '123-45'
			input.setSelectionRange(1, 1)
			await nextTick()
			expect(input.selectionStart).toBe(1)
		})

		it('без поля в DOM значение всё равно эмитится', () => {
			const { input, handlers, emit } = setupField({ mask: '###', withInputRef: false })
			handlers.handleInput(type(input, '12'))
			expect(emit).toHaveBeenCalledWith('update:modelValue', '12')
		})

		it('Backspace удаляет символ слева от курсора, пропуская разделители', () => {
			const { input, handlers, emit } = setupField({ mask: '###-###', value: '1234' })
			input.value = '123-4'
			const event = key(input, 'Backspace', 4)
			handlers.handleKeydown(event)

			expect(event.defaultPrevented).toBe(true)
			expect(emit).toHaveBeenCalledWith('update:modelValue', '124')
			expect(input.selectionStart).toBe(2)
		})

		it('Backspace в начале поля ничего не удаляет', () => {
			const { input, handlers, emit } = setupField({ mask: '###-###', value: '1234' })
			input.value = '123-4'
			handlers.handleKeydown(key(input, 'Backspace', 0))
			expect(emit).not.toHaveBeenCalled()
		})

		it('Backspace ничего не удаляет, если модель ещё не приняла введённое', () => {
			const { input, handlers, emit } = setupField({ mask: '###-###', value: '' })
			input.value = '123-4'
			const event = key(input, 'Backspace', 5)
			handlers.handleKeydown(event)
			expect(event.defaultPrevented).toBe(true)
			expect(emit).not.toHaveBeenCalled()
		})

		it('Delete удаляет символ справа от курсора и оставляет курсор на месте', () => {
			const { input, handlers, emit } = setupField({ mask: '###-###', value: '1234' })
			input.value = '123-4'
			const event = key(input, 'Delete', 1)
			handlers.handleKeydown(event)

			expect(event.defaultPrevented).toBe(true)
			expect(emit).toHaveBeenCalledWith('update:modelValue', '134')
			expect(input.selectionStart).toBe(1)
		})

		it('Delete в конце значения ничего не удаляет', () => {
			const { input, handlers, emit } = setupField({ mask: '###-###', value: '12' })
			input.value = '12'
			handlers.handleKeydown(key(input, 'Delete', 2))
			expect(emit).not.toHaveBeenCalled()
		})

		it('другие клавиши не отменяются', () => {
			const { input, handlers, emit } = setupField({ mask: '###', value: '12' })
			input.value = '12'
			const event = key(input, 'ArrowLeft', 2)
			handlers.handleKeydown(event)
			expect(event.defaultPrevented).toBe(false)
			expect(emit).not.toHaveBeenCalled()
		})

		it('клавиши не с поля ввода не обрабатываются', () => {
			const { handlers, emit } = setupField({ mask: '###', value: '12' })
			const event = new KeyboardEvent('keydown', { key: 'Backspace', cancelable: true })
			Object.defineProperty(event, 'target', { value: document.createElement('div') })
			handlers.handleKeydown(event)
			expect(event.defaultPrevented).toBe(false)
			expect(emit).not.toHaveBeenCalled()
		})

		it('числовое значение модели показывается по маске', () => {
			const { input, handlers } = setupField({ mask: '##-##', value: 1234, isReadonly: true })
			handlers.handleInput(type(input, '9'))
			expect(input.value).toBe('12-34')
		})

		it('пустая модель в поле только для чтения очищает поле, а совпадающее значение не трогает', () => {
			const { input, handlers } = setupField({ mask: '##-##', value: null, isReadonly: true })
			handlers.handleInput(type(input, '9'))
			expect(input.value).toBe('')

			const same = setupField({ mask: '##-##', value: '12', isReadonly: true })
			const event = type(same.input, '12')
			const setter = vi.spyOn(same.input, 'value', 'set')
			same.handlers.handleInput(event)
			expect(setter).not.toHaveBeenCalled()
		})
	})

	describe('фильтр символов без маски', () => {
		it.each([
			['digits', 'a1b2', '12'],
			['letters', 'Ab1Яё2', 'AbЯё'],
			['alphanumeric', 'a-1 б_2', 'a1б2'],
		] as const)('%s отбрасывает недопустимые символы', (allowedChars, typed, expected) => {
			const { input, handlers, emit } = setupField({ allowedChars })
			handlers.handleInput(type(input, typed))
			expect(input.value).toBe(expected)
			expect(emit).toHaveBeenCalledWith('update:modelValue', expected)
		})

		it('курсор остаётся там, где был бы без отброшенного символа', () => {
			const { input, handlers } = setupField({ allowedChars: 'digits' })
			handlers.handleInput(type(input, '12a34', 3))
			expect(input.value).toBe('1234')
			expect(input.selectionStart).toBe(2)
		})

		it('в поле без выделения текста (email) курсор не ставится', () => {
			const { input, handlers, emit } = setupField({ allowedChars: 'alphanumeric', type: 'email' })
			handlers.handleInput(type(input, 'ab!c'))
			expect(input.value).toBe('abc')
			expect(emit).toHaveBeenCalledWith('update:modelValue', 'abc')
		})

		it('допустимый ввод проходит без изменений', () => {
			const { input, handlers, emit } = setupField({ allowedChars: 'digits' })
			handlers.handleInput(type(input, '123'))
			expect(input.value).toBe('123')
			expect(emit).toHaveBeenCalledWith('update:modelValue', '123')
		})
	})
})
