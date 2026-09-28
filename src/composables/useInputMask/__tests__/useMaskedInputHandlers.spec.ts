import { describe, it, expect, vi } from 'vitest'
import { ref } from 'vue'
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
